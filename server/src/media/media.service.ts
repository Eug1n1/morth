import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { createReadStream, statSync } from "fs";
import * as filePath from "path";

@Injectable()
export class MediaService {
    constructor(private prisma: PrismaService) {}

    async getAllMedia() {
        const media = await this.prisma.media.findMany({
            select: {
                uuid: true,
                title: true,
                Type: {
                    select: {
                        name: true,
                    },
                },
                Thumb: {
                    select: {
                        thumbPath: true,
                    },
                },
                _count: {
                    select: {
                        Views: true,
                        Likes: true,
                    },
                },
            },
        });

        return media;
    }

    async getMediaByUuid(uuid: string) {
        const media = await this.prisma.media.findUnique({
            where: {
                uuid,
            },
            select: {
                uuid: true,
                title: true,
                Type: {
                    select: {
                        name: true,
                    },
                },
                Thumb: {
                    select: {
                        thumbPath: true,
                    },
                },
                _count: {
                    select: {
                        Views: true,
                        Likes: true,
                    },
                },
            },
        });

        return media;
    }

    async getMediaBlob(uuid: string, range: string) {
        const media = await this.prisma.media.findUnique({
            where: {
                uuid,
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
            throw "no media";
            //TODO: throw error
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
