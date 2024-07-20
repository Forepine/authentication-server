import { Module } from "@nestjs/common";
import { Utility } from "../helpers/utils";
import MONGOCONFIG from "../config/mongo.config";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { RolesModule } from "../roles/roles.module";
import { BanksModule } from "../banks/banks.module";
import { UsersService } from "../users/users.service";
import { ModulesModule } from "../modules/modules.module";
// import { PermissionsModule } from "../permissions/permissions.module";
import { OrganizationModule } from "../organizations/organizations.module";

@Module({
    imports: [
        ...MONGOCONFIG,
        UsersModule,
        RolesModule,
        ModulesModule,
        BanksModule,
        // PermissionsModule,
        OrganizationModule,
    ],
    controllers: [
        AuthController
    ],
    providers: [
        UsersService,
        Utility,
    ]
})
export class AuthModule { }