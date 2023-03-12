import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { MediaModule } from "./media/media.module";
import { AppLoggerMiddleware } from "./logger-middleware/http-logger.middleware";
import { TagsModule } from "./tags/tags.module";
import { AuthModule } from "./auth/auth.module";
import { FoldersModule } from "./folders/folders.module";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { DefaultGuard } from "./common/guards";

@Module({
    imports: [
        UsersModule,
        PrismaModule,
        MediaModule,
        TagsModule,
        AuthModule,
        FoldersModule,
        ConfigModule.forRoot({
            isGlobal: true
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: DefaultGuard
        }
    ]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AppLoggerMiddleware).forRoutes("*");
    }
}
