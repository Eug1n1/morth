import { Injectable } from "@nestjs/common";
import { Tag } from "@prisma/client";
import { TagNameSelect } from "src/common/selects";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) {}

    async getAll(userUuid: string): Promise<Partial<Tag>[]> {
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
                                    uuid: userUuid ?? 'anon',
                                },
                            },
                        },
                    },
                ],
            },
            select: {
                uuid: true,
                name: true,
            }
        });

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
            ...TagNameSelect,
        });

        return tags;
    }
}
