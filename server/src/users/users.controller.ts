import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { DisableGuard, User } from "src/common/decorators";
import { JwtGuard } from "src/common/guards";
import { UpdateUserDto } from "./dto";
import { UsersService } from "./users.service";

@Controller("api/users")
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get("/:username")
    async getUser(
        @User("sub") userId: string,
        @Param("username") username: string,
    ) {
        return await this.usersService.getUser(userId, username);
    }

    @Get("/:username/media")
    getUsersMedia(
        @User("sub") userId: string,
        @Param("username") username: string,
    ) {
        return this.usersService.getUsersMedia(userId, username);
    }

    @Get("/:username/likes")
    getUsersLikes(
        @User("sub") userId: string,
        @Param("username") username: string,
    ) {
        return this.usersService.getUserLikes(userId, username);
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Get("/:username/views")
    getUsersViews(
        @User("sub") userId: string,
        @Param("username") username: string,
    ) {
        return this.usersService.getUsersViews(userId, username);
    }

    @Get("/:username/folders")
    getUsersFolders(
        @User("sub") userId: string,
        @Param("username") username: string,
    ) {
        return this.usersService.getUsersFolders(userId, username);
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Patch("/")
    updateUser(@User("sub") userId: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.updateUser(userId, updateUserDto);
    }
}
