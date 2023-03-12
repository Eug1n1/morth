import { Controller, Get, Param } from "@nestjs/common";
import { User } from "src/common/decorators";
import { FoldersService } from "./folders.service";

@Controller("api/folders")
export class FoldersController {
    constructor(private foldersService: FoldersService) { }

    @Get("/")
    getAll(@User("sub") userUuid: string) {
        return this.foldersService.getAll(userUuid);
    }

    @Get("/:folder/media")
    getOneByUuid(
        @User("sub") userUuid: string,
        @Param("folder") folderUuid: string,
    ) {
        return this.foldersService.getFolderMedia(userUuid, folderUuid);
    }
}
