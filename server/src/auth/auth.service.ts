import {
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import { JwtPayload, Tokens } from "./types";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async signupLocal(authDto: AuthDto): Promise<Tokens> {
        const hash = await argon2.hash(authDto["password"]);

        let user = await this.prisma.user.findUnique({
            where: {
                username: authDto["username"],
            },
        });

        if (user) {
            throw new HttpException("user exists", HttpStatus.NOT_ACCEPTABLE);
        }

        user = await this.prisma.user.create({
            data: {
                username: authDto["username"],
                hash,
            },
        });

        const tokens = await this.getTokens(user.userId, user.username);

        return tokens;
    }

    async signinLocal(authDto: AuthDto): Promise<Tokens> {
        const user = await this.prisma.user.findUnique({
            where: {
                username: authDto["username"],
            },
            select: {
                username: true,
                userId: true,
                hash: true,
            },
        });

        if (!user) {
            throw new ForbiddenException(); // TODO: error message
        }

        const isPasswordMatches = await argon2.verify(
            user.hash,
            authDto["password"],
        );

        if (!isPasswordMatches) {
            throw new ForbiddenException(); // TODO: error message
        }

        const tokens = await this.getTokens(user.userId, user.username);

        return tokens;
    }

    async logout(userId: string) {
        await this.prisma.user.updateMany({
            where: {
                userId,
                hashedRt: {
                    not: null,
                },
            },
            data: {
                hashedRt: null,
            },
        });
    }

    async refreshTokens(userId: string, rt: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                userId: userId,
            },
            select: {
                userId: true,
                username: true,
                hashedRt: true,
            },
        });

        if (!user || !user["hashedRt"]) {
            throw new ForbiddenException("Access denied");
        }

        const isRtMatches = await argon2.verify(user["hashedRt"], rt);
        if (!isRtMatches) {
            throw new ForbiddenException("Access denied");
        }

        const tokens = await this.getTokens(user.userId, user.username);

        return tokens;
    }

    async getTokens(userId: string, username: string): Promise<Tokens> {
        const jwtPayload: JwtPayload = {
            sub: userId,
            username: username,
        };

        const atSecret = this.configService.get<string>("AT_SECRET");

        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(jwtPayload, {
                secret: atSecret,
                expiresIn: "15m",
            }),
            this.jwtService.signAsync(jwtPayload, {
                secret: this.configService.get<string>("RT_SECRET"),
                expiresIn: "7d",
            }),
        ]);

        this.updateRtHash(userId, rt); // TODO: move into getTokens function

        return {
            access_token: at,
            refresh_token: rt,
        };
    }

    async updateRtHash(userId: string, rt: string) {
        const hashedRt = await argon2.hash(rt); // TODO: store salt

        await this.prisma.user.update({
            where: {
                userId: userId ?? "anon",
            },
            data: {
                hashedRt,
            },
        });
    }
}
