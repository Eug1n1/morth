import { FileValidator } from "@nestjs/common";

export type ImageValidatorOptions = {};

export class ImageValidator extends FileValidator<ImageValidatorOptions> {
    constructor() {
        super({})
    }

    buildErrorMessage(): string {
        return `Validation failed ()`;
    }

    isValid(files: {
        file: Express.Multer.File[];
        thumb?: Express.Multer.File[];
    }): boolean {
        if (files.file[0].mimetype.match(/image/) && files["thumb"]) {
            return false;
        }

        return true;
    }
}
