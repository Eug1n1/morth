import {
    Controller,
    Get,
    Header,
    Param,
    Res,
    Headers,
    Patch,
    Body,
    Post,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { User } from "src/common/decorators";
import { UpdateMediaDto, UploadMediaDto } from "./dto";
import { MediaService } from "./media.service";

@Controller("api/media")
export class MediaController {
    constructor(private mediaService: MediaService) { }

    @Get("/")
    getAll(@User("sub") uuid: string) {
        return this.mediaService.getAllMedia(uuid);
    }

    @Get("/:uuid")
    getOneByUuid(@User("sub") userUuid: string, @Param("uuid") uuid: string) {
        return this.mediaService.getMediaByUuid(userUuid, uuid);
    }

    // @Get("/:uuid")
    // getOneByUuid(@User("sub") userUuid: string, @Param("uuid") uuid: string) {
    //     return this.mediaService.getMediaByUuid(userUuid, uuid);
    // }

    @Get("/:uuid/blob")
    @Header("Accept-Ranges", "bytes")
    async getStreamVideo(
        @User("sub") userUuid: string,
        @Param("uuid") mediaUuid: string,
        @Res() res: Response,
        @Headers("range") range: string,
    ) {
        const {
            headers: respHeaders,
            status,
            stream,
        } = await this.mediaService.getMediaBlob(userUuid, mediaUuid, range);

        res.writeHead(status, respHeaders);
        stream?.pipe(res);
    }

    @Patch("/:uuid")
    updateMedia(
        @User("sub") userUuid: string,
        @Param("uuid") mediaUuid: string,
        @Body() dto: UpdateMediaDto,
    ) {
        return this.mediaService.updateMedia(userUuid, mediaUuid, dto);
    }

    @Post("/upload")
    @UseInterceptors(FileInterceptor("file"))
    uploadMedia(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: UploadMediaDto,
    ) {
        console.log(body.title);
        console.log(file);
    }
}
