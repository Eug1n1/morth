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
        userId: string,
        targetUsername: string,
    ): Promise<Partial<User> | null> {
        const user = this.prisma.user.findUnique({
            where: {
                username: targetUsername,
            },
            select: {
                username: true,
            },
        });

        return user;
    }

    async getUsersMedia(
        userId: string,
        targetUsername: string,
    ): Promise<Partial<Media>[]> {
        const media = this.prisma.media.findMany({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        User: {
                            username: targetUsername,
                        },
                    },
                    {
                        isPrivate: true,
                        User: {
                            username: targetUsername,
                            userId: userId ?? "anon",
                        },
                    },
                ],
            },
            ...MediaInfoSelect,
        });

        return media;
    }
    async getUsersFolders(
        userId: string,
        targetUsername: string,
    ): Promise<Partial<Folder>[]> {
        const folders = this.prisma.folder.findMany({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        User: {
                            username: targetUsername,
                        },
                    },
                    {
                        isPrivate: true,
                        User: {
                            username: targetUsername,
                            userId,
                        },
                    },
                ],
            },
            select: {
                folderId: true,
                name: true,
            },
        });

        return folders;
    }

    async getUserLikes(
        userId: string,
        targetUsername: string,
    ): Promise<Partial<Media>[]> {
        const media = this.prisma.media.findMany({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        Likes: {
                            some: {
                                User: {
                                    username: targetUsername,
                                },
                            },
                        },
                    },
                    {
                        isPrivate: true,
                        userId: userId ?? "anon",
                        Likes: {
                            some: {
                                User: {
                                    userId: userId ?? "anon",
                                    username: targetUsername,
                                },
                            },
                        },
                    },
                ],
            },
        });

        return media;
    }

    async getUsersViews(
        userId: string,
        targetUsername: string,
    ): Promise<Partial<Media>[]> {
        const media = this.prisma.media.findMany({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        Views: {
                            some: {
                                User: {
                                    username: targetUsername,
                                },
                            },
                        },
                    },
                    {
                        isPrivate: true,
                        userId,
                        Views: {
                            some: {
                                User: {
                                    userId,
                                    username: targetUsername,
                                },
                            },
                        },
                    },
                ],
            },
            ...MediaInfoSelect,
        });

        return media;
    }

    async updateUser(
        userId: string,
        updateUserDto: UpdateUserDto,
    ): Promise<Partial<User>> {
        if (updateUserDto["hash"]) {
            updateUserDto["hash"] = await argon2.hash(updateUserDto["hash"]);
        }

        const user = this.prisma.user.update({
            where: {
                userId,
            },
            data: {
                ...updateUserDto,
            },
            select: {
                userId: true,
                username: true,
            },
        });

        return user;
    }
}
