import { Media } from "@prisma/client";
import { IsOptional, Length } from "class-validator";

export class PostFolderDto {
    @Length(5)
    name: string;

    @IsOptional()
    isPrivate?: boolean;

    @IsOptional()
    Media?: Media[]
}
