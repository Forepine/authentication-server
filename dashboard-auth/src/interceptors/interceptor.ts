import {
    Injectable,
    CallHandler,
    NestInterceptor,
    ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthUser } from '../types/auth-user.type';
import { LogsQueueProducer } from '../queue/producers/logs.producer';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

    constructor(
        private logsQueueProducer: LogsQueueProducer
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {

        const request = context.switchToHttp().getRequest();

        if (request.url.includes('logs')) return next.handle();

        const url = request.url;
        const method = request.method;
        const user = <AuthUser>request.user || undefined;
        const ip = request.ip;

        const logPayload = {
            route: url,
            method,
            user: user?.name || undefined,
            email: user?.email || request.body?.email || undefined,
            role: user?.role || undefined,
            ip,
        }

        // log save in DB
        await this.logsQueueProducer.add(logPayload);

        return next
            .handle()
            .pipe(
                tap(() => {
                    console.warn(`Log: ${logPayload.route}, ${logPayload.method} Saved`);
                }),
            );
    }
}