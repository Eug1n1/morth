import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { createReadStream, statSync } from "fs";
import { MediaInfoSelect } from "../common/selects";

@Injectable()
export class MediaService {
    constructor(private prisma: PrismaService) { }

    async getAllMedia(uuid: string) {
        const media = await this.prisma.media.findMany({
            where: {
                isPrivate: false,
            },
            ...MediaInfoSelect,
        });

        if (uuid) {
            const userPrivateMedia = await this.prisma.media.findMany({
                where: {
                    User: {
                        uuid,
                    },
                    isPrivate: true,
                },
                ...MediaInfoSelect,
            });

            media.push(...userPrivateMedia);
        }

        return media;
    }

    async getMediaByUuid(userUuid: string, uuid: string) {
        const media = await this.prisma.media.findFirst({
            where: {
                uuid,
            },
            ...MediaInfoSelect,
        });

        if (!media) {
            //TODO: throw error
            throw new ForbiddenException("no media");
        }

        if (media["isPrivate"] && media["User"]["uuid"] != userUuid) {
            throw new ForbiddenException();
        }

        return media;
    }

    async getMediaBlob(userUuid: string, uuid: string, range: string) {
        const media = await this.prisma.media.findFirst({
            where: {
                uuid,
            },
            select: {
                isPrivate: true,
                User: {
                    select: {
                        uuid: true,
                        username: true,
                    },
                },
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

        if (media["isPrivate"] && media["User"]["uuid"] != userUuid) {
            throw new ForbiddenException();
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

        // const ranges = range.split("-");

        // const CHUNK_SIZE = 10 ** 5;

        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
        // const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE, size - 1);

        // const start = Number(range.replace(/\D/g, ""));
        // const end = Math.min(start + CHUNK_SIZE, size - 1);

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
}
