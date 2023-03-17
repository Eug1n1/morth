import { Media } from "@prisma/client";
import { IsOptional, Length } from "class-validator";

export class UpdateFolderDto {
    @IsOptional()
    @Length(5)
    name?: string;

    @IsOptional()
    isPrivate?: boolean;

    @IsOptional()
    Media?: Media[]

    // @IsOptional()
    // Preview?: Express.Multer.File
}
