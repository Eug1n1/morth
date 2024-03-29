import { FileValidator } from "@nestjs/common";

export type MediaSizeValidatorOptions = {
    videoMaxSize: number;
    imageMaxSize: number;
    audioMaxSize: number;
};

export class MediaValidator extends FileValidator<MediaSizeValidatorOptions> {
    buildErrorMessage(): string {
        return `Validation failed (expected size is less than [video: ${this.validationOptions.videoMaxSize / 1024 / 1024
            }MB][image: ${this.validationOptions.imageMaxSize / 1024 / 1024
            }MB][audio: ${this.validationOptions.audioMaxSize / 1024 / 1024}MB])`;
    }

    public isValid(file: Express.Multer.File): boolean {
        if (!this.validationOptions) {
            return true;
        }

        if (file.mimetype.match(/video/))
            return file.size < this.validationOptions.videoMaxSize;

        if (file.mimetype.match(/image/))
            return file.size < this.validationOptions.imageMaxSize;

        if (file.mimetype.match(/audio/))
            return file.size < this.validationOptions.audioMaxSize;

        return false;
    }
}
