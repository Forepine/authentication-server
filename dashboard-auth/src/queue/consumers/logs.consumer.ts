import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { LoggersService } from "../../logger/logger.service";

@Processor('logs-queue')
export class LogsQueueConsumer {

    constructor(
        private loggersService: LoggersService
    ) { }

    @Process('add-log')
    async processData(job: Job) {
        const { data } = job;

        await this.loggersService.createLog(data);

        return true;
    }
}