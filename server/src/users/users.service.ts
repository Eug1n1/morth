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
        userUuid: string,
        username: string,
    ): Promise<Partial<User> | null> {
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

    async getUsersMedia(
        userUuid: string,
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
                            uuid: userUuid ?? "anon",
                        },
                    },
                ],
            },
            ...MediaInfoSelect,
        });

        return media;
    }
    async getUsersFolders(
        userUuid: string,
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
                            uuid: userUuid ?? "anon",
                        },
                    },
                ],
            },
            select: {
                name: true,
                uuid: true,
            },
        });

        return folders;
    }

    async getUsersLikes(
        userUuid: string,
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
                            uuid: userUuid ?? "anon",
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
        userUuid: string,
        username: string,
    ): Promise<{ Media: Partial<Media> }[]> {
        const views = this.prisma.view.findMany({
            where: {
                User: {
                    username,
                    uuid: userUuid ?? "anon",
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
        if (dto["hash"]) {
            dto["hash"] = await argon2.hash(dto["hash"]);
        }

        const user = this.prisma.user.update({
            where: {
                uuid: userUuid ?? "anon",
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
