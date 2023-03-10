import { Controller, Get, Header, Param, Res, Headers } from "@nestjs/common";
import { Response } from "express";
import { MediaService } from "./media.service";

@Controller("api/media")
export class MediaController {
    constructor(private mediaService: MediaService) {}

    @Get("/")
    getAll() {
        return this.mediaService.getAllMedia();
    }

    @Get("/:uuid")
    getOneByUuid(@Param("uuid") uuid: string) {
        return this.mediaService.getMediaByUuid(uuid);
    }

    @Get("/:uuid/blob")
    @Header("Accept-Ranges", "bytes")
    async getStreamVideo(
        @Param("uuid") uuid: string,
        // @Headers("range") range: string,
        @Res() res: Response,
        @Headers() headers: Record<string, string>,
    ) {
        const { range } = headers;
        const {
            headers: respHeaders,
            status,
            stream,
        } = await this.mediaService.getMediaBlob(uuid, range);

        res.writeHead(status, respHeaders);
        stream?.pipe(res);
    }
}
