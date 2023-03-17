import { Length } from "class-validator";

export class AddMediaDto {
    @Length(25)
    mediaId: string
}
