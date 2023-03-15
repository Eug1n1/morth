import { IsBoolean, IsOptional, IsString, MaxLength, MinLength, } from "class-validator";

export class UploadMediaDto {
    @MaxLength(150)
    @MinLength(1)
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    isPrivate?: boolean;
}
