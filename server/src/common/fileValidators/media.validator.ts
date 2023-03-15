import { FileValidator } from "@nestjs/common";

export type MediaSizeValidatorOptions = {
    videoMaxSize: number;
    imageMaxSize: number;
    audioMaxSize: number;
};

export class MediaValidatoj extends FileValidator<MediaSizeValidatorOptions> {
    buildErrorMessage(): string {
        return `Validation failed (expected size is less than [video: ${
            this.validationOptions.videoMaxSize / 1024 / 1024
        }MB][image: ${
            this.validationOptions.imageMaxSize / 1024 / 1024
        }MB][audio: ${this.validationOptions.audioMaxSize / 1024 / 1024}MB])`;
    }

    public isValid(files: {
        file: Express.Multer.File[];
        thumb?: Express.Multer.File[];
    }): boolean {
        if (!this.validationOptions) {
            return true;
        }

        const file = files.file[0];

        if (file.mimetype.match(/video/))
            return file.size < this.validationOptions.videoMaxSize;

        if (file.mimetype.match(/image/))
            return file.size < this.validationOptions.imageMaxSize;

        if (file.mimetype.match(/audio/))
            return file.size < this.validationOptions.audioMaxSize;

        return false;
    }
}
