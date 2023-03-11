import {
    Body,
    Controller,
    ForbiddenException,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { User } from "src/common/decorators";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import { Tokens } from "./types";

@Controller("api/auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("/local/signup")
    @HttpCode(HttpStatus.CREATED)
    signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
        return this.authService.signupLocal(dto);
    }

    @Post("/local/signin")
    @HttpCode(HttpStatus.OK)
    signinLocal(@Body() dto: AuthDto): Promise<Tokens> {
        return this.authService.signinLocal(dto);
    }

    @UseGuards(AuthGuard("jwt"))
    @Post("/logout")
    @HttpCode(HttpStatus.OK)
    logout(@User("sub") uuid: string) {
        if(!uuid) {
            throw new ForbiddenException('go out pls')
        }

        this.authService.logout(uuid);
    }

    @UseGuards(AuthGuard("jwt-refresh"))
    @Post("/refresh")
    @HttpCode(HttpStatus.OK)
    refreshTokens(
        @User("sub") uuid: string,
        @User("refreshToken") token: string,
    ) {
        return this.authService.refreshTokens(uuid, token);
    }
}
