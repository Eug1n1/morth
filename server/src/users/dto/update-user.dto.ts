import { IsOptional, MaxLength, MinLength, NotContains } from "class-validator";

export class UpdateUserDto {

    @NotContains(" ", { message: "No spaces allowed" })
    @IsOptional()
    username?: string;

    @MinLength(8)
    @MaxLength(24)
    @IsOptional()
    password?: string;
}
