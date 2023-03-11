import { Injectable } from "@nestjs/common";
import { Tag } from "@prisma/client";
import { TagNameSelect } from "src/common/selects";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) { }

    async getAll(userUuid: string): Promise<Partial<Tag>[]> {
        const tags = await this.prisma.tag.findMany({
            where: {
                Media: {
                    some: {
                        isPrivate: false,
                    },
                },
            },
            ...TagNameSelect
        });

        if (userUuid) {
            const userPrivateTags = await this.prisma.tag.findMany({
                where: {
                    Media: {
                        none: {
                            isPrivate: false,
                        },
                        some: {
                            User: {
                                uuid: userUuid,
                            },
                        },
                    },
                },
                ...TagNameSelect
            });

            tags.push(...userPrivateTags);
        }

        return tags;
    }

    getByTagUuid(): Promise<Partial<Tag>[]> {
        const tags = this.prisma.tag.findMany({
            where: {
                Media: {
                    some: {
                        isPrivate: false,
                    },
                },
            },
            ...TagNameSelect
        });

        return tags;
    }
}
