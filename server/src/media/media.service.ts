import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { createReadStream, statSync } from "fs";
import { MediaInfoSelect } from "../common/selects";
import { UpdateMediaDto } from "src/media/dto";

@Injectable()
export class MediaService {
    constructor(private prisma: PrismaService) {}

    async getAllMedia(userUuid: string) {
        const media = await this.prisma.media.findMany({
            where: {
                OR: [
                    {
                        isPrivate: false,
                    },
                    {
                        isPrivate: true,
                        User: {
                            uuid: userUuid ?? "anon",
                        },
                    },
                ],
            },
            ...MediaInfoSelect,
        });

        return media;
    }

    async getMediaByUuid(userUuid: string, mediaUuid: string) {
        console.log(mediaUuid);
        const media = await this.prisma.media.findFirst({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        uuid: mediaUuid,
                    },
                    {
                        isPrivate: true,
                        uuid: mediaUuid,
                        User: {
                            uuid: userUuid ?? "anon",
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

    async getMediaBlob(userUuid: string, mediaUuid: string, range: string) {
        const media = await this.prisma.media.findFirst({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        uuid: mediaUuid,
                    },
                    {
                        isPrivate: true,
                        uuid: mediaUuid,
                        User: {
                            uuid: userUuid ?? "anon",
                        },
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

        const { filePath } = media;
        const { size } = statSync(filePath);

        if (!range) {
            switch (media.Type.name) {
                case "video":
                    return {
                        stream: createReadStream(filePath),
                        status: 200,
                        headers: {
                            "Content-Length": size,
                            "Content-Type": "video/mp4",
                            //TODO: check mime type
                        },
                    };
                case "image":
                    return {
                        stream: createReadStream(filePath),
                        status: 200,
                        headers: {
                            "Content-Length": size,
                            "Content-Type": "image/jpg",
                            //TODO: check mime type
                        },
                    };
            }
        }

        const parts = range.replace(/bytes=/, "").split("-");

        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : size - 1;

        const contentLength = end - start + 1;

        const stream = createReadStream(filePath, { start, end });

        return {
            headers: {
                "Content-Range": `bytes ${start}-${end}/${size}`,
                "Content-Length": contentLength,
                "Content-Type": "video/mp4",
            },
            status: 206,
            stream: stream,
        };
    }

    async updateMedia(
        userUuid: string,
        mediaUuid: string,
        dto: UpdateMediaDto,
    ) {
        // const tags = dto["Tags"];
        delete dto["Tags"];

        await this.prisma.media.updateMany({
            where: {
                uuid: mediaUuid,
                User: {
                    uuid: userUuid,
                },
            },
            data: {
                ...dto,
            },
        });

        //TODO: tags
        return this.prisma.media.findFirst({
            where: {
                uuid: mediaUuid,
                User: {
                    uuid: userUuid,
                },
            },
            ...MediaInfoSelect
        })
    }
}
