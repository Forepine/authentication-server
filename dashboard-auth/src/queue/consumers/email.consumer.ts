import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EmailService } from '../../notifications/email.notification';

@Processor('email-queue')
export class EmailConsumerQueue {

    constructor(
        private emailService: EmailService
    ) { }

    @Process('welcome-email')
    async welcomeEmail(job: Job) {

        console.log('email data recieved in consumer and sent to email service')
        
        const { email, name, subject} = job?.data;

        return this.emailService.onBoardingEmail(email, name, subject);

    }
}