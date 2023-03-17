import { ForbiddenException, Injectable } from "@nestjs/common";
import { Folder } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AddMediaDto, PostFolderDto, UpdateFolderDto } from "./dto";

@Injectable()
export class FoldersService {
    constructor(private prisma: PrismaService) { }

    async getAll(userId: string) {
        const folders = await this.prisma.folder.findMany({
            where: {
                OR: [
                    {
                        isPrivate: false,
                    },
                    {
                        isPrivate: true,
                        userId: userId ?? "anon",
                    },
                ],
            },
            select: {
                folderId: true,
                name: true,
                isPrivate: true,
                User: {
                    select: {
                        userId: true,
                        username: true,
                    },
                },
            },
        });

        return folders;
    }

    async getFolderMedia(userId: string, folderId: string) {
        const folder = await this.prisma.folder.findFirst({
            where: {
                OR: [
                    {
                        folderId,
                        isPrivate: false,
                    },
                    {
                        folderId,
                        isPrivate: true,
                        userId: userId ?? "anon",
                    },
                ],
            },
            select: {
                folderId: true,
                isPrivate: true,
                User: {
                    select: {
                        userId: true,
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
                                folderId,
                            },
                        },
                    },
                    {
                        isPrivate: true,
                        Folders: {
                            some: {
                                folderId,
                            },
                        },
                        userId: userId ?? "anon",
                    },
                ],
            },
            select: {
                mediaId: true,
                title: true,
                isPrivate: true,
            },
        });

        return media;
    }

    async addMedia(userId: string, folderId: string, mediaDto: AddMediaDto) {
        return this.prisma.$transaction(async (tx) => {
            let folder: Partial<Folder> | null = await tx.folder.findFirst({
                where: {
                    folderId,
                    userId: userId,
                },
            });

            if (!folder) {
                throw new ForbiddenException();
            }

            const media = await tx.media.findFirst({
                where: {
                    OR: [
                        {
                            mediaId: mediaDto.mediaId,
                            isPrivate: true,
                            userId: userId ?? "anon",
                        },
                        {
                            mediaId: mediaDto.mediaId,
                            isPrivate: false,
                        },
                    ],
                },
            });

            if (!media) {
                throw new ForbiddenException();
            }

            folder = await tx.folder.update({
                where: {
                    folderId,
                },
                data: {
                    Media: {
                        connect: {
                            mediaId: mediaDto.mediaId,
                        },
                    },
                },
                select: {
                    folderId: true,
                    Media: {
                        select: {
                            mediaId: true,
                            title: true,
                        },
                    },
                },
            });

            return folder;
        });
    }

    async createFolder(userId: string, postFolderDto: PostFolderDto) {
        const folder = await this.prisma.folder.create({
            data: {
                name: postFolderDto["name"],
                isPrivate: postFolderDto["isPrivate"],
                User: {
                    connect: {
                        userId: userId ?? "anon",
                    },
                },
            },
        });

        //TODO: thumb

        return folder;
    }

    async updateFolder(
        userId: string,
        folderId: string,
        updateFolderDto: UpdateFolderDto,
    ) {
        return await this.prisma.$transaction(async (tx) => {
            let folder: Partial<Folder> | null = await tx.folder.findFirst({
                where: {
                    userId: userId ?? "anon",
                    folderId: folderId,
                },
            });

            if (!folder) {
                throw new ForbiddenException(); // TODO: error
            }

            folder = await tx.folder.update({
                where: {
                    folderId,
                },
                data: {
                    ...updateFolderDto,
                    Media: {
                        // TODO: thumb
                        connect: updateFolderDto["Media"],
                    },
                },
                select: {
                    // TODO: select
                    name: true,
                    isPrivate: true,
                    Media: {
                        select: {
                            mediaId: true,
                        },
                    },
                },
            });

            return folder;
        });
    }

    async deleteFolder(userId: string, folderId: string) {
        return await this.prisma.$transaction(async (tx) => {
            const folder = await tx.folder.findFirst({
                where: {
                    userId: userId,
                    folderId,
                },
            });

            if (!folder) {
                throw new ForbiddenException();
            }

            return tx.folder.delete({
                where: {
                    folderId,
                },
                select: {
                    name: true,
                },
            });
        });
    }

    deleteMediaFromFolder(userId: string, folderId: string, mediaId: string) {
        return this.prisma.$transaction(async (tx) => {
            const media = await tx.media.findFirst({
                where: {
                    mediaId,
                    userId,
                    Folders: {
                        some: {
                            folderId,
                        },
                    },
                },
            });

            if (!media) {
                throw new ForbiddenException();
            }

            return tx.media.update({
                where: {
                    mediaId,
                },
                data: {
                    Folders: {
                        disconnect: {
                            folderId,
                        },
                    },
                },
            });
        });
    }
}
