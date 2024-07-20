import { Module } from "@nestjs/common";
import { Utility } from "../helpers/utils";
import MONGOCONFIG from "../config/mongo.config";
import { ModulesService } from "./modules.service";
import { RolesModule } from "../roles/roles.module";
import { UsersService } from "../users/users.service";
import { ModulesController } from "./modules.controller";

@Module({
    imports: [
        ...MONGOCONFIG,
        RolesModule
    ],
    controllers: [
        ModulesController
    ],
    providers: [
        Utility,
        ModulesService,
        UsersService,
    ],
    exports:[
        ModulesService
    ]
})
export class ModulesModule { }