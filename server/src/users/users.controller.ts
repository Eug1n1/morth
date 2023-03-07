import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get("/:username")
    getUser(@Param('username') username: string) {
        return this.usersService.getUser(username);
    }

    @Get("/:username/media")
    getUsersMedia(@Param('username') username: string) {
        return this.usersService.getUsersMedia(username);
    }

    @Get("/:username/likes")
    getUsersLikes(@Param('username') username: string) {
        return this.usersService.getUsersLikes(username);
    }

    @Get("/:username/views")
    getUsersViews(@Param('username') username: string) {
        return this.usersService.getUsersViews(username);
    }

    @Get("/:username/folders")
    getUsersFolders(@Param('username') username: string) {
        return this.usersService.getUsersFolders(username);
    }
}
