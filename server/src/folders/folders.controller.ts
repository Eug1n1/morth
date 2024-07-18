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
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { DisableGuard, User } from "src/common/decorators";
import { MediaEntity } from "src/common/entities";
import { FolderEntity } from "src/common/entities/folder.entity";
import { JwtGuard } from "src/common/guards";
import { AddMediaDto, UpdateFolderDto } from "./dto";
import { PostFolderDto } from "./dto/post-folder.dto";
import { FoldersService } from "./folders.service";

@ApiTags("folders")
@Controller("api/folders")
export class FoldersController {
    constructor(private foldersService: FoldersService) {}

    @ApiOkResponse({ type: FolderEntity, isArray: true })
    @Get("/")
    getAll(@User("sub") userCuid: string) {
        return this.foldersService.getAll(userCuid);
    }

    @ApiOkResponse({ type: MediaEntity, isArray: true })
    @Get("/:folder/media")
    getOneById(
        @User("sub") userCuid: string,
        @Param("folder") folderCuid: string,
    ) {
        return this.foldersService.getFolderMedia(userCuid, folderCuid);
    }

    @ApiBearerAuth()
    @DisableGuard()
    @UseGuards(JwtGuard)
    @Post("/")
    createFolder(
        @User("sub") userCuid: string,
        @Body() postMediaDto: PostFolderDto,
    ) {
        return this.foldersService.createFolder(userCuid, postMediaDto);
    }

    @ApiBearerAuth()
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

    @ApiBearerAuth()
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

    @ApiBearerAuth()
    @DisableGuard()
    @UseGuards(JwtGuard)
    @Delete("/:folderId/media/:mediaId")
    deleteMediaFromFolder(
        @User("sub") userId: string,
        @Param("folderId") folderId: string,
        @Param("mediaId") mediaId: string,
    ) {
        return this.foldersService.deleteMediaFromFolder(
            userId,
            folderId,
            mediaId,
        );
    }

    @ApiBearerAuth()
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
