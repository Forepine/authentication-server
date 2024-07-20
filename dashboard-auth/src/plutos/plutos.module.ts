import { Module } from "@nestjs/common";
import { Utility } from "../helpers/utils";
import MONGOCONFIG from "../config/mongo.config";
import { PlutosService } from "./plutos.service";
import { UsersModule } from "../users/users.module";
import { RolesModule } from "../roles/roles.module";
import { PlutosController } from "./plutos.controller";
import { AdminAuthService } from "../admin/auth/admin-auth.service";

@Module({
    imports: [
        ...MONGOCONFIG,
        UsersModule,
        RolesModule,
        RolesModule,
    ],
    controllers: [
        PlutosController,
    ],
    providers: [
        Utility,
        PlutosService,
        AdminAuthService,
    ]
})
export class PlutosModule { }