import { Module } from "@nestjs/common";
import { Utility } from "../helpers/utils";
import { RolesService } from "./roles.service";
import MONGOCONFIG from "../config/mongo.config";
import { RolesController } from "./roles.controller";
import { UsersService } from "../users/users.service";


@Module({
    imports: [
        ...MONGOCONFIG,
    ],
    controllers: [
        RolesController
    ],
    providers: [
        Utility,
        RolesService,
        UsersService
    ],
    exports: [
        RolesService
    ]
})
export class RolesModule { }