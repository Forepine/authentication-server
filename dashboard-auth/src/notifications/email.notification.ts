import { Injectable } from '@nestjs/common';
import { SES } from 'aws-sdk';
import { MAIL_SUBJECT } from '../enums/enum';

@Injectable()
export class EmailService {

    constructor(
        private readonly ses: SES
    ) { }


    async onBoardingEmail(recipientEmail: string, name: string, subject: MAIL_SUBJECT): Promise<void> {

        const params = {

            Destination: {
                ToAddresses: [recipientEmail],
            },

            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: `Thanks for register on plutos ONE.`,
                    },
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: `${subject}, ${name}!`,
                },
            },

            Source: process.env.AWS_SOURCE_EMAIL,
        };

        try {
            await this.ses.sendEmail(params).promise();
            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

}
