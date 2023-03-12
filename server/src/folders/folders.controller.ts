import { Controller, Get, Param } from "@nestjs/common";
import { User } from "src/common/decorators";
import { FoldersService } from "./folders.service";

@Controller("api/folders")
export class FoldersController {
    constructor(private foldersService: FoldersService) { }

    @Get("/")
    getAll(@User("sub") userCuid: string) {
        return this.foldersService.getAll(userCuid);
    }

    @Get("/:folder/media")
    getOneByCuid(
        @User("sub") userCuid: string,
        @Param("folder") folderCuid: string,
    ) {
        return this.foldersService.getFolderMedia(userCuid, folderCuid);
    }
}
