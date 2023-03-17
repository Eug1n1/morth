import { Controller, Get, Param } from "@nestjs/common";
import { User } from "src/common/decorators";
import { TagsService } from "./tags.service";

@Controller("api/tags")
export class TagsController {
    constructor(private tagsService: TagsService) { }

    @Get("/")
    async getAll(@User("sub") userId: string) {
        return await this.tagsService.getAll(userId);
    }

    @Get("/:tag/media")
    async getTagMedia(@User("sub") userId: string, @Param('tag') tagId: string) {
        return await this.tagsService.getTagMedia(userId, tagId);
    }
}
