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
    Delete,
    UseGuards,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { diskStorage } from "multer";
import { DisableGuard, User } from "src/common/decorators";
import { MediaValidatoj as MediaValidator } from "src/common/fileValidators/media.validator";
import { JwtGuard } from "src/common/guards";
import { AddTagToMediaDto, UpdateMediaDto, UploadMediaDto } from "./dto";
import { MediaService } from "./media.service";

@Controller("api/media")
export class MediaController {
    constructor(private mediaService: MediaService) { }

    @Get("/")
    getAll(@User("sub") userId: string) {
        return this.mediaService.getAllMedia(userId);
    }

    @Get("/:mediaId")
    getOneMediaById(
        @User("sub") userId: string,
        @Param("mediaId") mediaId: string,
    ) {
        return this.mediaService.getMediaById(userId, mediaId);
    }

    @Get("/:mediaId/blob")
    @Header("Accept-Ranges", "bytes")
    async getStreamVideo(
        @User("sub") userId: string,
        @Param("mediaId") mediaId: string,
        @Headers("range") range: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const stream = await this.mediaService.getMediaBlob(
            userId,
            mediaId,
            res,
            range,
        );

        return new StreamableFile(stream);
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Patch("/:mediaId")
    updateMedia(
        @User("sub") userId: string,
        @Param("mediaId") mediaId: string,
        @Body() dto: UpdateMediaDto,
    ) {
        return this.mediaService.updateMedia(userId, mediaId, dto);
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
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
        @User("sub") userId: string,
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    // new ImageValidator(),
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
        return this.mediaService.uploadFile(userId, uploadMediaDto, files);
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Post("/:media/likes")
    likeMedia(@User("sub") userId: string, @Param("media") mediaId: string) {
        return this.mediaService.createLikeForMedia(userId, mediaId);
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Post("/:media/tags")
    addTagToMedia(
        @User("sub") userId: string,
        @Param("media") mediaId: string,
        @Body() addTagToMediaDto: AddTagToMediaDto,
    ) {
        return this.mediaService.addTagToMedia(
            userId,
            mediaId,
            addTagToMediaDto,
        );
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Delete("/:mediaId")
    deleteMedia(
        @User("sub") userId: string,
        @Param("mediaId") mediaId: string,
    ) {
        return this.mediaService.deleteMedia(userId, mediaId);
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Delete("/:media/tags/:tagId")
    deleteTagFromMedia(
        @User("sub") userId: string,
        @Param("media") mediaId: string,
        @Param('tagId') tagId: string,
    ) {
        return this.mediaService.deleteTagFromMedia(
            userId,
            mediaId,
            tagId,
        );
    }
}
