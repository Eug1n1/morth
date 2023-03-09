import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateUserDto } from "./dto";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async getUser(username: string) {
        const user = await this.prisma.user.findUnique({
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

    async getUsersMedia(username: string) {
        const media = await this.prisma.media.findMany({
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
    async getUsersFolders(username: string) {
        const folders = await this.prisma.folder.findMany({
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
    async getUsersLikes(username: string) {
        const likes = await this.prisma.like.findMany({
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

    async getUsersViews(username: string) {
        const views = await this.prisma.view.findMany({
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

    async updateUser(userUuid: string, dto: UpdateUserDto) {
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
