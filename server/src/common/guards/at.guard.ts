import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class AtGuard extends AuthGuard("jwt") {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        if (request.user) {
            return true;
        }

        return false
    }
}
