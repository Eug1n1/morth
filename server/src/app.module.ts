import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { MediaModule } from "./media/media.module";
import { AppLoggerMiddleware } from "./logger-middleware/http-logger.middleware";
import { TagsModule } from './tags/tags.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [UsersModule, PrismaModule, MediaModule, TagsModule, AuthModule],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AppLoggerMiddleware).forRoutes("*");
    }
}
