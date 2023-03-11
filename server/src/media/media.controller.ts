import { Controller, Get, Header, Param, Res, Headers, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { User } from "src/common/decorators";
import { MediaService } from "./media.service";

@Controller("api/media")
export class MediaController {
    constructor(private mediaService: MediaService) { }

    @UseGuards(AuthGuard(['jwt', 'anonymous']))
    @Get("/")
    getAll(@User('sub') uuid: string) {
        return this.mediaService.getAllMedia(uuid);
    }

    @UseGuards(AuthGuard(['jwt', 'anonymous']))
    @Get("/:uuid")
    getOneByUuid(@User('sub') userUuid: string, @Param("uuid") uuid: string) {
        return this.mediaService.getMediaByUuid(userUuid, uuid);
    }

    @UseGuards(AuthGuard(['jwt', 'anonymous']))
    @Get("/:uuid/blob")
    @Header("Accept-Ranges", "bytes")
    async getStreamVideo(
        @User('sub') userUuid: string,
        @Param("uuid") mediaUuid: string,
        @Res() res: Response,
        @Headers('range') range: string,
    ) {
        const {
            headers: respHeaders,
            status,
            stream,
        } = await this.mediaService.getMediaBlob(userUuid, mediaUuid, range);

        res.writeHead(status, respHeaders);
        stream?.pipe(res);
    }
}
