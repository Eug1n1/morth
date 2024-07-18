import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { DisableGuard, User } from "src/common/decorators";
import { MediaEntity } from "src/common/entities";
import { FolderEntity } from "src/common/entities/folder.entity";
import { JwtGuard } from "src/common/guards";
import { UpdateUserDto } from "./dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("api/users")
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get("/:username")
    async getUser(
        @User("sub") userId: string,
        @Param("username") username: string,
    ) {
        return await this.usersService.getUser(userId, username);
    }

    @ApiOkResponse({ type: MediaEntity, isArray: true })
    @Get("/:username/media")
    getUsersMedia(
        @User("sub") userId: string,
        @Param("username") username: string,
    ) {
        return this.usersService.getUsersMedia(userId, username);
    }

    @ApiOkResponse({ type: MediaEntity, isArray: true })
    @Get("/:username/likes")
    getUsersLikes(
        @User("sub") userId: string,
        @Param("username") username: string,
    ) {
        return this.usersService.getUserLikes(userId, username);
    }

    @ApiOkResponse({ type: MediaEntity, isArray: true })
    @DisableGuard()
    @UseGuards(JwtGuard)
    @Get("/:username/views")
    getUsersViews(
        @User("sub") userId: string,
        @Param("username") username: string,
    ) {
        return this.usersService.getUsersViews(userId, username);
    }

    @ApiOkResponse({ type: FolderEntity, isArray: true })
    @Get("/:username/folders")
    getUsersFolders(
        @User("sub") userId: string,
        @Param("username") username: string,
    ) {
        return this.usersService.getUsersFolders(userId, username);
    }

    @ApiBearerAuth()
    @DisableGuard()
    @UseGuards(JwtGuard)
    @Patch("/")
    updateUser(
        @User("sub") userId: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.updateUser(userId, updateUserDto);
    }
}
