import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from './auth.controller';
import { JwtModule } from "@nestjs/jwt";
import { AnonymousStrategy, AtStrategy, RtStrategy } from "./strategies";

@Module({
    imports: [JwtModule.register({})],
    controllers: [AuthController],
    providers: [AuthService, AtStrategy, RtStrategy, AnonymousStrategy],
})
export class AuthModule {}
