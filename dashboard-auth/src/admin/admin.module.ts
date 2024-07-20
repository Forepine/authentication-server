import { Module } from "@nestjs/common";
import { Utility } from "../helpers/utils";
import MONGOCONFIG from "../config/mongo.config";
import { RolesModule } from "../roles/roles.module";
import { UsersModule } from "../users/users.module";
import { AdminController } from "./admin.controller";
import { UsersService } from "../users/users.service";
import { OrganizationModule } from "../organizations/organizations.module";

@Module({
    imports: [
        ...MONGOCONFIG,
        RolesModule,
        UsersModule,
        RolesModule,
        OrganizationModule
    ],
    controllers: [
        AdminController
    ],
    providers: [
        UsersService,
        Utility,
    ]
})
export class AdminModule { }