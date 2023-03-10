import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import { JwtPayload, Tokens } from "./types";

@Controller("api/auth")
export class AuthController {
    constructor(private authService: AuthService) { }

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
    logout(@Req() req: Request & { user: JwtPayload }) {
        const uuid: string = req.user["sub"];

        this.authService.logout(uuid);
    }

    @UseGuards(AuthGuard("jwt-refresh"))
    @Post("/refresh")
    @HttpCode(HttpStatus.OK)
    refreshTokens(@Req() req: Request & { user: JwtPayload }) {
        const uuid: string = req.user["sub"];

        this.authService.logout(uuid);
    }
}
