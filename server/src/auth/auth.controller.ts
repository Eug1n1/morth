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
import { DisableGuard, User } from "src/common/decorators";
import { RefreshGuard } from "src/common/guards";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import { Tokens } from "./types";

@Controller("api/auth")
export class AuthController {
    constructor(private authService: AuthService) { }

    @DisableGuard()
    @Post("/local/signup")
    @HttpCode(HttpStatus.CREATED)
    signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
        return this.authService.signupLocal(dto);
    }

    @DisableGuard()
    @Post("/local/signin")
    @HttpCode(HttpStatus.OK)
    signinLocal(@Body() dto: AuthDto): Promise<Tokens> {
        return this.authService.signinLocal(dto);
    }

    @Post("/logout")
    @HttpCode(HttpStatus.OK)
    logout(@User("sub") cuid: string) {
        if (!cuid) {
            throw new ForbiddenException("go out pls");
        }

        this.authService.logout(cuid);
    }

    @DisableGuard()
    @UseGuards(RefreshGuard)
    @Post("/refresh")
    @HttpCode(HttpStatus.OK)
    refreshTokens(
        @User("sub") cuid: string,
        @User("refreshToken") token: string,
    ) {
        return this.authService.refreshTokens(cuid, token);
    }
}
