import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { DisableGuard, User } from "src/common/decorators";
import { JwtGuard } from "src/common/guards";
import { AddMediaDto, UpdateFolderDto } from "./dto";
import { PostFolderDto } from "./dto/post-folder.dto";
import { FoldersService } from "./folders.service";

@Controller("api/folders")
export class FoldersController {
    constructor(private foldersService: FoldersService) { }

    @Get("/")
    getAll(@User("sub") userCuid: string) {
        return this.foldersService.getAll(userCuid);
    }

    @Get("/:folder/media")
    getOneById(
        @User("sub") userCuid: string,
        @Param("folder") folderCuid: string,
    ) {
        return this.foldersService.getFolderMedia(userCuid, folderCuid);
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Post("/")
    createFolder(
        @User("sub") userCuid: string,
        @Body() postMediaDto: PostFolderDto,
    ) {
        return this.foldersService.createFolder(userCuid, postMediaDto);
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Post("/:folder/media")
    addMedia(
        @User("sub") userCuid: string,
        @Param("folder") folderCuid: string,
        @Body() addMediaDto: AddMediaDto,
    ) {
        return this.foldersService.addMedia(userCuid, folderCuid, addMediaDto);
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Patch("/:folder")
    updateFolder(
        @User("sub") userCuid: string,
        @Param("folder") folderCuid: string,
        @Body() updateFolderDto: UpdateFolderDto,
    ) {
        return this.foldersService.updateFolder(
            userCuid,
            folderCuid,
            updateFolderDto,
        );
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Delete("/:folder")
    deleteMediaFromFolder(
        @User("sub") userId: string,
        @Param("folder") folderId: string,
        @Param("media") mediaId: string,
    ) {
        return this.foldersService.deleteMediaFromFolder(userId, folderId, mediaId);
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Delete("/:folder")
    deleteFolder(
        @User("sub") userCuid: string,
        @Param("folder") folderCuid: string,
    ) {
        return this.foldersService.deleteFolder(userCuid, folderCuid);
    }
}
