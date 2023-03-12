import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { User } from "src/common/decorators";
import { UpdateUserDto } from "./dto";
import { UsersService } from "./users.service";

@Controller("api/users")
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get("/:username")
    async getUser(@User('sub') userUuid: string, @Param("username") username: string) {
        return await this.usersService.getUser(userUuid, username);
    }

    @Get("/:username/media")
    getUsersMedia(@User('sub') userUuid: string, @Param("username") username: string) {
        return this.usersService.getUsersMedia(userUuid, username);
    }

    @Get("/:username/likes")
    getUsersLikes(@User('sub') userUuid: string, @Param("username") username: string) {
        return this.usersService.getUsersLikes(userUuid, username);
    }

    @Get("/:username/views")
    getUsersViews(@User('sub') userUuid: string, @Param("username") username: string) {
        return this.usersService.getUsersViews(userUuid, username);
    }

    @Get("/:username/folders")
    getUsersFolders(@User('sub') userUuid: string, @Param("username") username: string) {
        return this.usersService.getUsersFolders(userUuid, username);
    }

    @Patch("/")
    updateUser(@User("sub") uuid: string, @Body() dto: UpdateUserDto) {
        return this.usersService.updateUser(uuid, dto);
    }
}
