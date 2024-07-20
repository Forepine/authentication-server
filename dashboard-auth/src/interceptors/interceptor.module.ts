import { Module } from "@nestjs/common";
import MONGOCONFIG from "../config/mongo.config";
import { LoggingInterceptor } from "./interceptor";
import { QUEUECONFIG } from "../config/queue.config";
import { LoggersService } from "../logger/logger.service";
import { LogsQueueProducer } from "../queue/producers/logs.producer";
import { LogsQueueConsumer } from "../queue/consumers/logs.consumer";

@Module({
    imports: [
        ...MONGOCONFIG,
        ...QUEUECONFIG
    ],
    providers: [
        LoggersService,
        LogsQueueConsumer,
        LogsQueueProducer,
        LoggingInterceptor,
    ],
})
export class InterceptorModule { }