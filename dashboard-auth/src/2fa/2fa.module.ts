import { Module } from "@nestjs/common";
import { Utility } from "../helpers/utils";
import { twoFAController } from "./2fa.controller";
import { UsersModule } from "../users/users.module";
import { RolesModule } from "../roles/roles.module";

@Module({
    imports: [
        UsersModule,
        RolesModule,
    ],
    providers: [Utility],
    controllers: [twoFAController]
})
export class TwoFAModule { }