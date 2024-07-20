import { Module } from "@nestjs/common";
import { ScopesController } from "./scopes.controller";
import { ScopesService } from "./scopes.service";
import MONGOCONFIG from "../config/mongo.config";
import { Utility } from "../helpers/utils";
import { RolesModule } from "../roles/roles.module";
import { UsersModule } from "../users/users.module";

@Module({
    imports: [
        ...MONGOCONFIG,
        RolesModule,
        UsersModule,
    ],
    controllers: [
        ScopesController
    ],
    providers: [
        Utility,
        ScopesService
    ]
})
export class ScopesModule { }