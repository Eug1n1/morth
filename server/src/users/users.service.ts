import { Injectable } from "@nestjs/common";
import { Folder, Like, Media, User, View } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateUserDto } from "./dto";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async getUser(username: string): Promise<Partial<User> | null> {
        const user = this.prisma.user.findUnique({
            where: {
                username,
            },
            select: {
                uuid: true,
                username: true,
            },
        });

        return user;
    }

    async getUsersMedia(username: string): Promise<Partial<Media>[]> {
        const media = this.prisma.media.findMany({
            where: {
                User: {
                    username,
                },
            },
            select: {
                uuid: true,
                title: true,
                Thumb: {
                    select: {
                        thumbPath: true,
                    },
                },
                _count: {
                    select: {
                        Views: true,
                    },
                },
            },
        });

        return media;
    }
    async getUsersFolders(username: string): Promise<Partial<Folder>[]> {
        const folders = this.prisma.folder.findMany({
            where: {
                User: {
                    username,
                },
            },
            select: {
                name: true,
                uuid: true,
                _count: {
                    select: {
                        Media: true,
                    },
                },
            },
        });

        return folders;
    }
    async getUsersLikes(
        username: string,
    ): Promise<{ Media: Partial<Media> }[]> {
        const likes = this.prisma.like.findMany({
            where: {
                User: {
                    username,
                },
            },
            select: {
                Media: {
                    select: {
                        uuid: true,
                        title: true,
                        Thumb: {
                            select: {
                                thumbPath: true,
                            },
                        },
                        _count: {
                            select: {
                                Views: true,
                            },
                        },
                    },
                },
            },
        });

        return likes;
    }

    async getUsersViews(
        username: string,
    ): Promise<{ Media: Partial<Media> }[]> {
        const views = this.prisma.view.findMany({
            where: {
                User: {
                    username,
                },
            },
            select: {
                Media: {
                    select: {
                        uuid: true,
                        title: true,
                        Thumb: {
                            select: {
                                thumbPath: true,
                            },
                        },
                        _count: {
                            select: {
                                Views: true,
                            },
                        },
                    },
                },
            },
        });

        return views;
    }

    async updateUser(
        userUuid: string,
        dto: UpdateUserDto,
    ): Promise<Partial<User>> {
        const user = this.prisma.user.update({
            where: {
                uuid: userUuid,
            },
            data: {
                ...dto,
            },
            select: {
                uuid: true,
                username: true,
            },
        });

        return user;
    }
}
