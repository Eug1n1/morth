import { Tag } from "@prisma/client";
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateMediaDto {
    @MaxLength(150)
    @MinLength(1)
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    isPrivate?: boolean;

    @IsOptional()
    Tags?: Tag[]

    @IsOptional()
    preview?: Express.Multer.File
}
