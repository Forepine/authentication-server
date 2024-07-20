import { Module } from "@nestjs/common";
import MONGOCONFIG from "../config/mongo.config";
import { LoggersService } from "./logger.service";
import { LoggersController } from "./logger.controller";

@Module({
    imports: [
        ...MONGOCONFIG
    ],
    controllers: [
        LoggersController
    ],
    providers: [
        LoggersService
    ]
})
export class LoggersModule { }