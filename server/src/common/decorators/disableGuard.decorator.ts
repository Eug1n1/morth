import { SetMetadata } from "@nestjs/common";

export const DisableGuard = () => SetMetadata("isDisabled", true);
