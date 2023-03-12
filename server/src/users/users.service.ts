import { Injectable } from "@nestjs/common";
import { Folder, Media, User } from "@prisma/client";
import { MediaInfoSelect } from "src/common/selects";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateUserDto } from "./dto";
import * as argon2 from "argon2";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async getUser(
        userCuid: string,
        username: string,
    ): Promise<Partial<User> | null> {
        const user = this.prisma.user.findUnique({
            where: {
                username,
            },
            select: {
                cuid: true,
                username: true,
            },
        });

        return user;
    }

    async getUsersMedia(
        userCuid: string,
        username: string,
    ): Promise<Partial<Media>[]> {
        const media = this.prisma.media.findMany({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        User: {
                            username: username,
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
            ...MediaInfoSelect,
        });

        return media;
    }
    async getUsersFolders(
        userCuid: string,
        username: string,
    ): Promise<Partial<Folder>[]> {
        const folders = this.prisma.folder.findMany({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        User: {
                            username: username,
                        },
                    },
                    {
                        isPrivate: true,
                        User: {
                            username,
                            cuid: userCuid ?? "anon",
                        },
                    },
                ],
            },
            select: {
                name: true,
                cuid: true,
            },
        });

        return folders;
    }

    async getUsersLikes(
        userCuid: string,
        username: string,
    ): Promise<{ Media: Partial<Media> }[]> {
        const likes = this.prisma.like.findMany({
            where: {
                OR: [
                    {
                        User: {
                            username,
                        },
                        Media: {
                            isPrivate: false,
                        },
                    },
                    {
                        User: {
                            username,
                            cuid: userCuid ?? "anon",
                        },
                        Media: {
                            isPrivate: true,
                        },
                    },
                ],
            },
            select: {
                Media: {
                    select: {
                        cuid: true,
                        title: true,
                        Thumb: {
                            select: {
                                imagePath: true,
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
        userCuid: string,
        username: string,
    ): Promise<{ Media: Partial<Media> }[]> {
        const views = this.prisma.view.findMany({
            where: {
                User: {
                    username,
                    cuid: userCuid ?? "anon",
                },
            },
            select: {
                Media: {
                    select: {
                        cuid: true,
                        title: true,
                        Thumb: {
                            select: {
                                imagePath: true,
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
        userCuid: string,
        dto: UpdateUserDto,
    ): Promise<Partial<User>> {
        if (dto["hash"]) {
            dto["hash"] = await argon2.hash(dto["hash"]);
        }

        const user = this.prisma.user.update({
            where: {
                cuid: userCuid ?? "anon",
            },
            data: {
                ...dto,
            },
            select: {
                cuid: true,
                username: true,
            },
        });

        return user;
    }
}
