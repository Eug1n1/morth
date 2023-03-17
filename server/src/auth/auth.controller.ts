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
    constructor(private authService: AuthService) {}

    @DisableGuard()
    @Post("/local/signup")
    @HttpCode(HttpStatus.CREATED)
    signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
        return this.authService.signupLocal(dto);
    }

    @DisableGuard()
    @Post("/local/signin")
    @HttpCode(HttpStatus.OK)
    async signinLocal(
        @Body() dto: AuthDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<Tokens> {
        const tokens = this.authService.signinLocal(dto);
        return tokens;
    }

    @DisableGuard()
    @UseGuards(JwtGuard)
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
