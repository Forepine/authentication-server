import { Module } from "@nestjs/common";
import { Utility } from "../helpers/utils";
import MONGOCONFIG from "../config/mongo.config";
import { RolesModule } from "../roles/roles.module";
import { UsersService } from "../users/users.service";
import { OrganizationService } from "./organizations.service";
import { OrganizationController } from "./organizations.controller";
import { UsersModule } from "../users/users.module";


@Module({
    imports: [
        ...MONGOCONFIG,
        RolesModule,
        UsersModule,
    ],
    controllers: [
        OrganizationController
    ],
    providers: [
        Utility,
        // UsersService,
        OrganizationService,
    ],
    exports: [
        OrganizationService
    ]
})
export class OrganizationModule { }