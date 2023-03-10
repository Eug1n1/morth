import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) {}

    async getAll() {
        // return await this.prisma.tag.findMany({
        //     where: {
        //         NOT: {
        //             Media: {
        //                 none: {},
        //             },
        //         },
        //     },
        //     select: {
        //         name: true,
        //         Media: {
        //             select: {
        //                 uuid: true,
        //             },
        //         },
        //     },
        // });
        //

        return await this.prisma.tag.findMany({
            select: {
                name: true,
                // _count: {
                //     select: {
                //         Media: true,
                //     },
                // },
            },
        });
    }
}
