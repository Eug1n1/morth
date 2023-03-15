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
    UseInterceptors,
    StreamableFile,
    UploadedFiles,
    ParseFilePipe,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { diskStorage } from "multer";
import { User } from "src/common/decorators";
import { ImageValidator } from "src/common/fileValidators/image-thumb.validator";
import { MediaValidatoj as MediaValidator } from "src/common/fileValidators/media.validator";
import { UpdateMediaDto, UploadMediaDto } from "./dto";
import { MediaService } from "./media.service";

@Controller("api/media")
export class MediaController {
    constructor(private mediaService: MediaService) {}

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
        @Headers("range") range: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const stream = await this.mediaService.getMediaBlob(
            userCuid,
            mediaCuid,
            res,
            range,
        );

        return new StreamableFile(stream);
    }

    @Patch("/:cuid")
    updateMedia(
        @User("sub") userCuid: string,
        @Param("cuid") mediaCuid: string,
        @Body() dto: UpdateMediaDto,
    ) {
        return this.mediaService.updateMedia(userCuid, mediaCuid, dto);
    }

    @Post("upload")
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: "file", maxCount: 1 },
                { name: "thumb", maxCount: 1 },
            ],
            {
                storage: diskStorage({
                    destination(_, file, callback) {
                        if (file.fieldname === "thumb") {
                            callback(
                                null,
                                "/home/eug1n1/Downloads/uploads/thumbs",
                            );

                            return;
                        }

                        callback(null, "/home/eug1n1/Downloads/uploads/");
                    },
                    filename(_, file, callback) {
                        callback(null, `${Date.now()}_${file.originalname}`);
                    },
                }),
            },
        ),
    )
    uploadFile(
        @User("sub") userCuid: string,
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new ImageValidator(),
                    new MediaValidator({
                        videoMaxSize: 2 * 1024 * 1024 * 1024,
                        imageMaxSize: 10 * 1024 * 1024,
                        audioMaxSize: 10 * 1024 * 1024,
                    }),
                ],
            }),
        )
        files: {
            file: Express.Multer.File[];
            thumb?: Express.Multer.File[];
        },
        @Body() uploadMediaDto: UploadMediaDto,
    ) {
        console.log("success");
        // return this.mediaService.uploadFile(userCuid, uploadMediaDto, files);
    }
}
