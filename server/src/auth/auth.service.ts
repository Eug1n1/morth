import {
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import * as argon2 from "argon2";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import { JwtPayload, Tokens } from "./types";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async signupLocal(dto: AuthDto): Promise<Tokens> {
        const hash = await argon2.hash(dto.password);

        let user = await this.prisma.user.findUnique({
            where: {
                username: dto.username,
            },
        });

        if (user) {
            throw new HttpException("gser exists", HttpStatus.NOT_ACCEPTABLE);
        }

        user = await this.prisma.user.create({
            data: {
                username: dto.username,
                hash,
            },
        });

        const tokens = await this.getTokens(user.uuid, user.username);

        return tokens;
    }

    async signinLocal(dto: AuthDto): Promise<Tokens> {
        const user = await this.prisma.user.findUnique({
            where: {
                username: dto.username,
            },
            select: {
                username: true,
                uuid: true,
                hash: true,
            },
        });

        if (!user) {
            throw new ForbiddenException(); // TODO: error message
        }

        const isPasswordMatches = await argon2.verify(user.hash, dto.password);

        if (!isPasswordMatches) {
            throw new ForbiddenException(); // TODO: error message
        }

        const tokens = await this.getTokens(user.uuid, user.username);

        return tokens;
    }

    async logout(uuid: string) {
        await this.prisma.user.updateMany({
            where: {
                uuid,
                hashedRt: {
                    not: null,
                },
            },
            data: {
                hashedRt: null,
            },
        });
    }

    async refreshTokens(uuid: string, rt: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                uuid,
            },
            select: {
                hashedRt: true,
                username: true,
                uuid: true,
            },
        });

        if (!user || !user["hashedRt"]) {
            throw new ForbiddenException("Access denied");
        }

        const isRtMatches = await argon2.verify(user["hashedRt"], rt);
        if (!isRtMatches) {
            throw new ForbiddenException("Access denied");
        }

        const tokens = await this.getTokens(user.uuid, user.username);

        return tokens;
    }

    async getTokens(userUuid: string, username: string): Promise<Tokens> {
        const jwtPayload: JwtPayload = {
            sub: userUuid,
            username: username,
        };

        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(jwtPayload, {
                secret: "at_secret",
                expiresIn: "15m",
            }),
            this.jwtService.signAsync(jwtPayload, {
                secret: "rt_secret",
                expiresIn: "7d",
            }),
        ]);

        this.updateRtHash(userUuid, rt); // TODO: move into getTokens function

        return {
            access_token: at,
            refresh_token: rt,
        };
    }

    async updateRtHash(uuid: string, rt: string) {
        const hashedRt = await argon2.hash(rt); // TODO: store salt

        await this.prisma.user.update({
            where: {
                uuid,
            },
            data: {
                hashedRt,
            },
        });
    }
}
