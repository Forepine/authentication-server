import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class LogsQueueProducer {
    constructor(
        @InjectQueue('logs-queue') private logsQueue: Queue
    ) { }

    async add(data: any) {

        const job = await this.logsQueue.add('add-log', data, { delay: 2000 });

        return job.id;
    }
}