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
    getAll(@User("sub") cuid: string) {
        return this.mediaService.getAllMedia(cuid);
    }

    @Get("/:cuid")
    getOneByCuid(@User("sub") userCuid: string, @Param("cuid") cuid: string) {
        return this.mediaService.getMediaByCuid(userCuid, cuid);
    }

    // @Get("/:cuid")
    // getOneByCuid(@User("sub") userCuid: string, @Param("cuid") cuid: string) {
    //     return this.mediaService.getMediaByCuid(userCuid, cuid);
    // }

    @Get("/:cuid/blob")
    @Header("Accept-Ranges", "bytes")
    async getStreamVideo(
        @User("sub") userCuid: string,
        @Param("cuid") mediaCuid: string,
        @Res() res: Response,
        @Headers("range") range: string,
    ) {
        const {
            headers: respHeaders,
            status,
            stream,
        } = await this.mediaService.getMediaBlob(userCuid, mediaCuid, range);

        res.writeHead(status, respHeaders);
        stream?.pipe(res);
    }

    @Patch("/:cuid")
    updateMedia(
        @User("sub") userCuid: string,
        @Param("cuid") mediaCuid: string,
        @Body() dto: UpdateMediaDto,
    ) {
        return this.mediaService.updateMedia(userCuid, mediaCuid, dto);
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
