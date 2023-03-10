import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { UpdateUserDto } from "./dto";
import { UsersService } from "./users.service";

@Controller("api/users")
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get("/:username")
    async getUser(@Param("username") username: string) {
        return await this.usersService.getUser(username);
    }

    @Get("/:username/media")
    getUsersMedia(@Param("username") username: string) {
        return this.usersService.getUsersMedia(username);
    }

    @Get("/:username/likes")
    getUsersLikes(@Param("username") username: string) {
        return this.usersService.getUsersLikes(username);
    }

    @Get("/:username/views")
    getUsersViews(@Param("username") username: string) {
        return this.usersService.getUsersViews(username);
    }

    @Get("/:username/folders")
    getUsersFolders(@Param("username") username: string) {
        return this.usersService.getUsersFolders(username);
    }

    @Patch("/")
    updateUser(@Body("uuid") uuid: string, @Body() dto: UpdateUserDto) {
        return this.usersService.updateUser(uuid, dto)
    }
}
