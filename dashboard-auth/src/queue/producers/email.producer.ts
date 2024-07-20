import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class EmailProducerQueue {

    constructor(
        @InjectQueue('email-queue') private emailQueue: Queue
    ) { }

    async welcomeEmail(data: any) {
        try {
            const job = await this.emailQueue.add('welcome-email', data, { delay: 5000 });
            console.log('email data recieved in producer');
            return job.id;

        } catch (error) {
            console.error(error.message);
            return null
        }
    }
}