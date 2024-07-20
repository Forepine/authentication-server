import { Module } from '@nestjs/common';
import { SES } from 'aws-sdk';


@Module({
    providers: [
        {
            provide: SES,
            useFactory: async () => {
                const sesConfig = {
                    apiVersion: '2010-12-01',
                    region: process.env.AWS_REGION,
                    credentials: {
                        accessKeyId: process.env.AWS_ACCESS_KEY,
                        secretAccessKey: process.env.AWS_ACCESS_SECRET
                    },
                };
                return new SES(sesConfig);
            },
        },
    ],
    exports: [SES],
})
export class AWSModule { }
