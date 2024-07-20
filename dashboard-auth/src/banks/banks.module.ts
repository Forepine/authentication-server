import { Module } from "@nestjs/common";
import { Utility } from "../helpers/utils";
import { BanksService } from "./banks.service";
import MONGOCONFIG from "../config/mongo.config";
import { RolesModule } from "../roles/roles.module";
import { UsersModule } from "../users/users.module";
import { BanksController } from "./banks.controller";

@Module({
    imports: [
        ...MONGOCONFIG,
        UsersModule,
        RolesModule
    ],
    providers: [
        Utility,
        BanksService
    ],
    controllers: [
        BanksController
    ],
    exports: [
        BanksService
    ]
})
export class BanksModule { }