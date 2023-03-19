import {
    Body,
    Controller,
    ForbiddenException,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from "@nestjs/common";
import { DisableGuard, User } from "src/common/decorators";
import { JwtGuard, RefreshGuard } from "src/common/guards";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import { Tokens } from "./types";

@Controller("api/auth")
export class AuthController {
    constructor(private authService: AuthService) { }

    @DisableGuard()
    @Post("/local/signup")
    @HttpCode(HttpStatus.CREATED)
    signupLocal(@Body() authDto: AuthDto): Promise<Tokens> {
        return this.authService.signupLocal(authDto);
    }

    @DisableGuard()
    @Post("/local/signin")
    @HttpCode(HttpStatus.OK)
    async signinLocal(@Body() authDto: AuthDto): Promise<Tokens> {
        const tokens = this.authService.signinLocal(authDto);
        return tokens;
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
    @Post("/logout")
    @HttpCode(HttpStatus.OK)
    logout(@User("sub") userId: string) {
        this.authService.logout(userId);
    }

    @DisableGuard()
    @UseGuards(RefreshGuard)
    @Post("/refresh")
    @HttpCode(HttpStatus.OK)
    refreshTokens(
        @User("sub") userId: string,
        @User("refreshToken") token: string,
    ) {
        return this.authService.refreshTokens(userId, token);
    }
}
