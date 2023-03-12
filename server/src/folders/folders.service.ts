import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class FoldersService {
    constructor(private prisma: PrismaService) { }

    async getAll(userCuid: string) {
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
                            cuid: userCuid ?? "anon",
                        },
                    },
                ],
            },
            select: {
                cuid: true,
                name: true,
                isPrivate: true,
                User: {
                    select: {
                        cuid: true,
                        username: true,
                    },
                },
            },
        });

        return folders;
    }

    async getFolderMedia(userCuid: string, folderCuid: string) {
        const folder = await this.prisma.folder.findFirst({
            where: {
                OR: [
                    {
                        cuid: folderCuid,
                        isPrivate: false,
                    },
                    {
                        cuid: folderCuid,
                        isPrivate: true,
                        User: {
                            cuid: userCuid ?? "anon",
                        },
                    },
                ],
            },
            select: {
                cuid: true,
                isPrivate: true,
                User: {
                    select: {
                        cuid: true,
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
                                cuid: folderCuid,
                            },
                        },
                    },
                    {
                        isPrivate: true,
                        Folders: {
                            some: {
                                cuid: folderCuid,
                            },
                        },
                        User: {
                            cuid: userCuid ?? "anon",
                        },
                    },
                ],
            },
            select: {
                cuid: true,
                title: true,
                isPrivate: true,
            },
        });

        return media;
    }
}
