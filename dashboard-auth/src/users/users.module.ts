import { Module } from "@nestjs/common";
import { Utility } from "../helpers/utils";
import { UsersService } from "./users.service";
import MONGOCONFIG from "../config/mongo.config";
import { UsersController } from "./users.controller";
import { RolesModule } from "../roles/roles.module";

@Module({
    imports: [
        ...MONGOCONFIG,
        RolesModule,
    ],
    controllers: [
        UsersController
    ],
    providers: [
        Utility,
        UsersService,
    ],
    exports: [
        UsersService
    ]
})
export class UsersModule { }
