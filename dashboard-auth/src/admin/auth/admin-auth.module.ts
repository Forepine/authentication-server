import { Module } from "@nestjs/common";
import { Utility } from "../../helpers/utils";
import MONGOCONFIG from "../../config/mongo.config";
import { AdminAuthService } from "./admin-auth.service";
import { RolesService } from "../../roles/roles.service";
import { AdminAuthController } from "./admin-auth.controller";
import { EmailProducerQueue } from "../../queue/producers/email.producer";
import { QUEUECONFIG } from "../../config/queue.config";
import { UsersService } from "../../users/users.service";

@Module({
    imports: [
        ...MONGOCONFIG,
        ...QUEUECONFIG,
    ],
    controllers: [AdminAuthController],
    providers: [
        Utility,
        UsersService,
        RolesService,
        AdminAuthService,
        EmailProducerQueue,
    ],
    exports: []
})
export class AdminAuthModule { }