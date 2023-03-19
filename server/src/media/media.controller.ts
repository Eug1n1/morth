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
    ParseFilePipe,
    Delete,
    UseGuards,
    UploadedFile,
    Req,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { diskStorage } from "multer";
import { DisableGuard, User } from "src/common/decorators";
import { MediaValidator } from "src/common/fileValidators/media.validator";
import { JwtGuard } from "src/common/guards";
import { AddTagToMediaDto, UpdateMediaDto, UploadMediaDto } from "./dto";
import { MediaService } from "./media.service";

@Controller("api/media")
export class MediaController {
    constructor(
        private mediaService: MediaService,
        private configService: ConfigService,
    ) {}

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
        FileInterceptor("file", {
            storage: diskStorage({
                destination(req, file, callback) {
                    callback(
                        null,
                        process.env["UPLOAD_DIR"] ??
                            "/home/eug1n1/Downloads/uploads/",
                    );
                },
                filename(_, file, callback) {
                    callback(null, `${Date.now()}_${file.originalname}`);
                },
            }),
        }),
    )
    uploadFile(
        @User("sub") userId: string,
        @UploadedFile(
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
        file: Express.Multer.File,
        @Body() uploadMediaDto: UploadMediaDto,
    ) {
        return this.mediaService.uploadFile(userId, uploadMediaDto, file);
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Post("/:mediaId/likes")
    createLikeForMedia(
        @User("sub") userId: string,
        @Param("mediaId") mediaId: string,
    ) {
        return this.mediaService.createLikeForMedia(userId, mediaId);
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Post("/:mediaId/tags")
    addTagToMedia(
        @User("sub") userId: string,
        @Param("mediaId") mediaId: string,
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
    @Delete("/:mediaId/likes")
    deleteLikeFromMedia(
        @User("sub") userId: string,
        @Param("mediaId") mediaId: string,
    ) {
        return this.mediaService.deleteLikeFromMedia(userId, mediaId);
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
    @Delete("/:mediaId/tags/:tagId")
    deleteTagFromMedia(
        @User("sub") userId: string,
        @Param("mediaId") mediaId: string,
        @Param("tagId") tagId: string,
    ) {
        return this.mediaService.deleteTagFromMedia(userId, mediaId, tagId);
    }
}
