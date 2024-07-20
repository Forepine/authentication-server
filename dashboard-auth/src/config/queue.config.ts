import { BullModule } from "@nestjs/bull";

export const QUEUECONFIG = [
    BullModule.forRoot({
        redis: {
            // host: process.env.REDIS_HOST,
            host: 'redis',
            // port: +process.env.REDIS_PORT,
            port: 6379,
            // password: process.env.REDIS_PASSWORD,
        },
    }),
    BullModule.registerQueue(
        {
            name: 'email-queue',
        },
        {
            name: 'logs-queue'
        }
    )


]