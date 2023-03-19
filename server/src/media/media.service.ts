import {
    HttpException,
    HttpStatus,
    Injectable,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { createReadStream, ReadStream, statSync } from "fs";
import { MediaInfoSelect } from "../common/selects";
import {
    AddTagToMediaDto,
    UpdateMediaDto,
    UploadMediaDto,
} from "src/media/dto";
import { Like, Media } from "@prisma/client";
import { Response } from "express";
import { join } from "path";
import { Worker } from "worker_threads";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MediaService {
    constructor(private prisma: PrismaService, private config: ConfigService) { }

    async getAllMedia(userId: string): Promise<Partial<Media>[]> {
        const media = this.prisma.media.findMany({
            where: {
                OR: [
                    {
                        isPrivate: false,
                    },
                    {
                        isPrivate: true,
                        User: {
                            userId: userId ?? "anon",
                        },
                    },
                ],
            },
            ...MediaInfoSelect,
        });

        return media;
    }

    async getMediaById(
        userId: string,
        mediaId: string,
    ): Promise<Partial<Media>> {
        const media = await this.prisma.media.findFirst({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        mediaId,
                    },
                    {
                        isPrivate: true,
                        mediaId,
                        userId: userId ?? "anon",
                    },
                ],
            },
            ...MediaInfoSelect,
        });

        if (!media) {
            //TODO: throw error
            throw new HttpException("media not found", HttpStatus.NOT_FOUND); //TODO: error
        }

        return media;
    }

    async getMediaBlob(
        userId: string,
        mediaId: string,
        res: Response,
        range: string,
    ): Promise<ReadStream> {
        const media = await this.prisma.media.findFirst({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        mediaId,
                    },
                    {
                        isPrivate: true,
                        mediaId,
                        userId: userId ?? "anon",
                    },
                ],
            },
            select: {
                filePath: true,
                Type: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!media) {
            throw new HttpException("media not found", HttpStatus.NOT_FOUND); //TODO: error
        }

        const { name: mime } = media["Type"];
        const { size } = statSync(media["filePath"]);

        if (!range) {
            res.writeHead(200, {
                "Content-Length": size,
                "Content-Type": mime,
            });
            return createReadStream(media["filePath"]);
        }

        const parts = range.replace(/bytes=/, "").split("-");

        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : size - 1;

        const contentLength = end - start + 1;

        const stream = createReadStream(media["filePath"], { start, end });

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${size}`,
            "Content-Length": contentLength,
            "Content-Type": mime,
        });

        return stream;
    }

    async updateMedia(
        userId: string,
        mediaId: string,
        updateMediaDto: UpdateMediaDto,
    ): Promise<Partial<Media>> {
        return this.prisma.$transaction(async (tx) => {
            const tags = updateMediaDto["Tags"];
            delete updateMediaDto["Tags"];

            let media: Partial<Media> | null = await tx.media.findFirst({
                where: {
                    userId: userId ?? "anon",
                    mediaId,
                },
            });

            if (!media) {
                throw new HttpException(
                    "media not found",
                    HttpStatus.NOT_FOUND,
                ); //TODO: error
            }

            media = await tx.media.update({
                where: {
                    mediaId,
                },
                data: {
                    ...updateMediaDto,
                    Tags: {
                        connectOrCreate: tags?.map((tag) => {
                            return {
                                where: { tagId: tag.tagId },
                                create: { tagId: tag.tagId },
                            };
                        }),
                    },
                },
                ...MediaInfoSelect,
            });

            return media;
        });
    }

    async uploadFile(
        userId: string,
        uploadMediaDto: UploadMediaDto,
        file: Express.Multer.File,
    ): Promise<Partial<Media>> {
        console.log(userId)
        const media = await this.prisma.media.create({
            data: {
                filePath: join(
                    this.config.get<string>('UPLOAD_DIR') ?? '/home/eug1n1/Downloads/uploads/',
                    file.filename,
                ), //TODO: filepath
                title: uploadMediaDto["title"] ?? file.originalname,
                Type: {
                    connectOrCreate: {
                        where: {
                            name: file.mimetype,
                        },
                        create: {
                            name: file.mimetype,
                        },
                    },
                },
                User: {
                    connect: {
                        userId,
                    },
                },
            },
        });

        return media;
    }

    async deleteMedia(
        userId: string,
        mediaId: string,
    ): Promise<Partial<Media>> {
        return this.prisma.$transaction(async (tx) => {
            const media = await tx.media.findFirst({
                where: {
                    userId,
                    mediaId,
                },
                select: {
                    mediaId: true,
                    title: true,
                },
            });

            if (!media) {
                throw new HttpException(
                    "media not found",
                    HttpStatus.NOT_FOUND,
                ); //TODO: error
            }

            const path: string = (
                await tx.media.delete({
                    where: {
                        mediaId,
                    },
                    select: {
                        filePath: true,
                    },
                })
            )["filePath"];

            const worker = new Worker("./src/utils/delete.worker.js", {
                workerData: {
                    path,
                },
            });

            worker.on("message", (msg: { success: boolean; error?: any }) => {
                if (msg.error) {
                    throw "";
                }
            });

            return media;
        });
    }

    createLikeForMedia(
        userId: string,
        mediaId: string,
    ): Promise<Partial<Like>> {
        return this.prisma.$transaction(async (tx) => {
            const media = await this.prisma.media.findUnique({
                where: {
                    mediaId,
                },
            });

            if (!media) {
                throw new HttpException(
                    "media not found",
                    HttpStatus.NOT_FOUND,
                ); //TODO: error
            }

            return this.prisma.like.create({
                data: {
                    User: {
                        connect: {
                            userId,
                        },
                    },
                    Media: {
                        connect: {
                            mediaId,
                        },
                    },
                },
            });
        });
    }

    deleteLikeFromMedia(
        userId: string,
        mediaId: string,
    ): Promise<Partial<Like>> {
        return this.prisma.$transaction(async (tx) => {
            const like = await this.prisma.like.findFirst({
                where: {
                    userId,
                    mediaId,
                },
            });

            if (!like) {
                throw new HttpException("like not found", HttpStatus.NOT_FOUND); //TODO: error
            }

            return this.prisma.like.delete({
                where: {
                    userId_mediaId: {
                        userId,
                        mediaId,
                    },
                },
            });
        });
    }

    async addTagToMedia(
        userId: string,
        mediaId: string,
        addTagToMediaDto: AddTagToMediaDto,
    ): Promise<Partial<Media>> {
        return this.prisma.$transaction(async (tx) => {
            const media = await tx.media.findFirst({
                where: {
                    mediaId,
                    userId,
                    Tags: {
                        none: {
                            tagId: addTagToMediaDto.tagId,
                        },
                    },
                },
            });

            if (!media) {
                throw new HttpException(
                    "not found",
                    HttpStatus.NOT_FOUND,
                ); //TODO: error
            }

            return tx.media.update({
                where: {
                    mediaId: mediaId,
                },
                data: {
                    Tags: {
                        connectOrCreate: {
                            where: {
                                tagId: addTagToMediaDto.tagId,
                            },
                            create: {
                                tagId: addTagToMediaDto.tagId,
                            },
                        },
                    },
                },
                ...MediaInfoSelect,
            });
        });
    }

    deleteTagFromMedia(userId: string, mediaId: string, tagId: string) {
        return this.prisma.$transaction(async (tx) => {
            const media = await tx.media.findFirst({
                where: {
                    mediaId,
                    userId,
                    Tags: {
                        some: {
                            tagId,
                        },
                    },
                },
            });

            if (!media) {
                throw new HttpException(
                    "media not found",
                    HttpStatus.NOT_FOUND,
                ); //TODO: error
            }

            return tx.media.update({
                where: {
                    mediaId,
                },
                data: {
                    Tags: {
                        disconnect: {
                            tagId,
                        },
                    },
                },
            });
        });
    }

    // createUserView(userId: string, mediaId: string) {
    //     return this.prisma.$transaction(tx => {
    //     })
    // }
}
