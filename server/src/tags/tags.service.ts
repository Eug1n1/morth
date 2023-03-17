import { Injectable } from "@nestjs/common";
import { Tag } from "@prisma/client";
import { MediaInfoSelect } from "src/common/selects";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) { }

    async getAll(userId: string): Promise<Partial<Tag>[]> {
        const tags = await this.prisma.tag.findMany({
            where: {
                OR: [
                    {
                        Media: {
                            some: {
                                isPrivate: false,
                            },
                        },
                    },
                    {
                        Media: {
                            none: {
                                isPrivate: false,
                            },
                            some: {
                                userId: userId ?? "anon",
                            },
                        },
                    },
                ],
            },
            select: {
                tagId: true,
            },
        });

        return tags;
    }

    async getTagMedia(userId: string, tagId: string) {
        const media = await this.prisma.media.findMany({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        Tags: {
                            some: {
                                tagId,
                            },
                        },
                    },
                    {
                        isPrivate: true,
                        userId: userId ?? "anon",
                        Tags: {
                            some: {
                                tagId,
                            },
                        },
                    },
                ],
            },
            ...MediaInfoSelect,
        });

        return media;
    }
}
