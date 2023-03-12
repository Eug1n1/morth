import { Controller, Get, Param } from "@nestjs/common";
import { User } from "src/common/decorators";
import { TagsService } from "./tags.service";

@Controller("api/tags")
export class TagsController {
    constructor(private tagsService: TagsService) { }

    @Get("/")
    async getAll(@User("sub") userUuid: string) {
        return await this.tagsService.getAll(userUuid);
    }

    @Get("/:tag/media")
    async getTagMedia(@User("sub") userUuid: string, @Param('tag') tagName: string) {
        return await this.tagsService.getTagMedia(userUuid, tagName);
    }
}
