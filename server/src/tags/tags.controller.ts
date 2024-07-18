import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { User } from "src/common/decorators";
import { MediaEntity, TagEntity } from "src/common/entities";
import { TagsService } from "./tags.service";

@ApiTags("tags")
@Controller("api/tags")
export class TagsController {
    constructor(private tagsService: TagsService) {}

    @ApiOkResponse({ type: TagEntity })
    @Get("/")
    async getAll(@User("sub") userId: string) {
        return await this.tagsService.getAll(userId);
    }

    @ApiOkResponse({ type: MediaEntity, isArray: true })
    @Get("/:tag/media")
    async getTagMedia(
        @User("sub") userId: string,
        @Param("tag") tagId: string,
    ) {
        return await this.tagsService.getTagMedia(userId, tagId);
    }
}
