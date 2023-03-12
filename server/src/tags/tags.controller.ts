import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { User } from "src/common/decorators";
import { TagsService } from "./tags.service";

@Controller("api/tags")
export class TagsController {
    constructor(private tagsService: TagsService) {}

    @UseGuards(AuthGuard(["jwt", "anonymous"]))
    @Get("/")
    async getAll(@User("sub") userUuid: string) {
        return await this.tagsService.getAll(userUuid);
    }
}
