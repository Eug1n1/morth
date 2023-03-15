import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { createReadStream, ReadStream, statSync } from "fs";
import { MediaInfoSelect } from "../common/selects";
import { UpdateMediaDto, UploadMediaDto } from "src/media/dto";
import { Media } from "@prisma/client";
import { Response } from "express";
import { join } from "path";

@Injectable()
export class MediaService {
    constructor(private prisma: PrismaService) {}

    async getAllMedia(userCuid: string) {
        const media = await this.prisma.media.findMany({
            where: {
                OR: [
                    {
                        isPrivate: false,
                    },
                    {
                        isPrivate: true,
                        User: {
                            cuid: userCuid ?? "anon",
                        },
                    },
                ],
            },
            ...MediaInfoSelect,
        });

        return media;
    }

    async getMediaByCuid(userCuid: string, mediaCuid: string) {
        const media = await this.prisma.media.findFirst({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        cuid: mediaCuid,
                    },
                    {
                        isPrivate: true,
                        cuid: mediaCuid,
                        User: {
                            cuid: userCuid ?? "anon",
                        },
                    },
                ],
            },
            ...MediaInfoSelect,
        });

        if (!media) {
            //TODO: throw error
            throw new ForbiddenException("no media");
        }

        return media;
    }

    async getMediaBlob(
        userCuid: string,
        mediaCuid: string,
        res: Response,
        range: string,
    ): Promise<ReadStream> {
        const media = await this.prisma.media.findFirst({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        cuid: mediaCuid,
                    },
                    {
                        isPrivate: true,
                        cuid: mediaCuid,
                        userCuid: userCuid ?? "anon",
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
            throw new ForbiddenException("no media"); // TODO: error message
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
        userCuid: string,
        mediaCuid: string,
        updateMediaDto: UpdateMediaDto,
    ) {
        const tags = updateMediaDto["Tags"];
        delete updateMediaDto["Tags"];

        let media: Partial<Media> | null = await this.prisma.media.findFirst({
            where: {
                userCuid: userCuid ?? "anon",
                cuid: mediaCuid,
            },
        });

        if (!media) {
            throw new ForbiddenException(); //TODO: error
        }

        media = await this.prisma.media.update({
            where: {
                cuid: mediaCuid,
            },
            data: {
                ...updateMediaDto,
                // Thumb: {
                //     create: TODO: upload new thumb
                // }
                Tags: {
                    connectOrCreate: tags?.map((tag) => {
                        return {
                            where: { name: tag.name },
                            create: { name: tag.name },
                        };
                    }),
                },
            },
            ...MediaInfoSelect,
        });

        return media;
    }

    async uploadFile(
        userCuid: string,
        uploadMediaDto: UploadMediaDto,
        files: {
            file: Express.Multer.File[];
            thumb?: Express.Multer.File[];
        },
    ) {
        const media = await this.prisma.media.create({
            data: {
                filePath: join(
                    "/home/eug1n1/Downloads/uploads",
                    files.file![0].filename,
                ), //TODO: filepath
                title: uploadMediaDto["title"] ?? files.file?.[0].originalname,
                Type: {
                    connectOrCreate: {
                        where: {
                            name: files.file[0].mimetype,
                        },
                        create: {
                            name: files.file[0].mimetype,
                        },
                    },
                },
                User: {
                    connect: {
                        cuid: userCuid ?? "anon",
                    },
                },
            },
        });

        if (files.thumb) {
            await this.prisma.image.create({
                data: {
                    imagePath: join(
                        "/home/eug1n1/Downloads/uploads/thumbs",
                        files.thumb?.[0].filename,
                    ),
                    Media: {
                        connect: {
                            cuid: media['cuid']
                        }
                    }
                },
            });
        }

        return media;
    }
}
