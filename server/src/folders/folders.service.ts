import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class FoldersService {
    constructor(private prisma: PrismaService) { }

    async getAll(userUuid: string) {
        const folders = await this.prisma.folder.findMany({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        Media: {
                            some: {
                                isPrivate: false,
                            },
                        },
                    },
                    {
                        isPrivate: true,
                        User: {
                            uuid: userUuid ?? "anon",
                        },
                    },
                ],
            },
            select: {
                uuid: true,
                name: true,
                isPrivate: true,
                User: {
                    select: {
                        uuid: true,
                        username: true,
                    },
                },
            },
        });

        return folders;
    }

    async getFolderMedia(userUuid: string, folderUuid: string) {
        const folder = await this.prisma.folder.findFirst({
            where: {
                OR: [
                    {
                        uuid: folderUuid,
                        isPrivate: false,
                    },
                    {
                        uuid: folderUuid,
                        isPrivate: true,
                        User: {
                            uuid: userUuid ?? "anon",
                        },
                    },
                ],
            },
            select: {
                uuid: true,
                isPrivate: true,
                User: {
                    select: {
                        uuid: true,
                    },
                },
            },
        });

        if (!folder) {
            throw new ForbiddenException();
        }

        const media = await this.prisma.media.findMany({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        Folders: {
                            some: {
                                uuid: folderUuid,
                            },
                        },
                    },
                    {
                        isPrivate: true,
                        Folders: {
                            some: {
                                uuid: folderUuid,
                            },
                        },
                        User: {
                            uuid: userUuid ?? "anon",
                        },
                    },
                ],
            },
            select: {
                uuid: true,
                title: true,
                isPrivate: true,
            },
        });

        return media;
    }
}
