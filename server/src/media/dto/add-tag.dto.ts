import { IsString, MaxLength, MinLength } from "class-validator"

export class AddTagToMediaDto {
    @IsString()
    @MaxLength(30)
    @MinLength(2)
    tagId: string
}
