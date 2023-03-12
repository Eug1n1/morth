import { Injectable } from "@nestjs/common";
import { Tag } from "@prisma/client";
import { User } from "src/common/decorators";
import { MediaInfoSelect, TagNameSelect } from "src/common/selects";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) {}

    async getAll(userCuid: string): Promise<Partial<Tag>[]> {
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
                                User: {
                                    cuid: userCuid ?? "anon",
                                },
                            },
                        },
                    },
                ],
            },
            select: {
                cuid: true,
                name: true,
            },
        });

        return tags;
    }

    async getTagMedia(userCuid: string, tagName: string) {
        const media = await this.prisma.media.findMany({
            where: {
                OR: [
                    {
                        isPrivate: false,
                        Tags: {
                            some: {
                                name: tagName 
                            }
                        }
                    },
                    {
                        isPrivate: true,
                        User: {
                            cuid: userCuid,
                        },
                        Tags: {
                            some: {
                                name: tagName 
                            }
                        }
                    },
                ],
            },
            ...MediaInfoSelect,
        });


        return media
    }
}
