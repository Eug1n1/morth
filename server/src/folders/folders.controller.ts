import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/common/decorators';
import { FoldersService } from './folders.service';

@Controller('api/folders')
export class FoldersController {
    constructor(private foldersService: FoldersService) {}

    @UseGuards(AuthGuard(['jwt', 'anonymous']))
    @Get('/')
    getAll(@User('sub') userUuid: string) {
        return this.foldersService.getAll(userUuid)
    }

    @UseGuards(AuthGuard(['jwt', 'anonymous']))
    @Get('/:folder/media')
    getOneByUuid(@User('sub') userUuid: string, @Param('folder') folderUuid: string) {
        return this.foldersService.getFolderMedia(userUuid, folderUuid)
    }
}
