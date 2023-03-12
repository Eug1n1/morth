import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { User } from "src/common/decorators";
import { UpdateUserDto } from "./dto";
import { UsersService } from "./users.service";

@Controller("api/users")
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get("/:username")
    async getUser(
        @User("sub") userCuid: string,
        @Param("username") username: string,
    ) {
        return await this.usersService.getUser(userCuid, username);
    }

    @Get("/:username/media")
    getUsersMedia(
        @User("sub") userCuid: string,
        @Param("username") username: string,
    ) {
        return this.usersService.getUsersMedia(userCuid, username);
    }

    @Get("/:username/likes")
    getUsersLikes(
        @User("sub") userCuid: string,
        @Param("username") username: string,
    ) {
        return this.usersService.getUsersLikes(userCuid, username);
    }

    @Get("/:username/views")
    getUsersViews(
        @User("sub") userCuid: string,
        @Param("username") username: string,
    ) {
        return this.usersService.getUsersViews(userCuid, username);
    }

    @Get("/:username/folders")
    getUsersFolders(
        @User("sub") userCuid: string,
        @Param("username") username: string,
    ) {
        return this.usersService.getUsersFolders(userCuid, username);
    }

    @Patch("/")
    updateUser(@User("sub") cuid: string, @Body() dto: UpdateUserDto) {
        return this.usersService.updateUser(cuid, dto);
    }
}
