import {
    Res,
    Get,
    Query,
    HttpStatus,
    Controller,
    HttpException,
} from "@nestjs/common";
import { Response } from 'express';
import { Paged } from "../types/pagination.type";
import { LoggersService } from "./logger.service";

@Controller('logs')
export class LoggersController {

    constructor(
        private loggerService: LoggersService
    ) { }


    @Get()
    async getLogs(
        @Res() res: Response,
        @Query() paged: Paged
    ) {

        paged.offset = +paged.offset || 0;
        paged.limit = +paged.limit || 10

        const logs = await this.loggerService.readLogs(paged);

        if (!logs || logs.length < 0) {
            throw new HttpException(
                `No logs exist`,
                HttpStatus.NOT_FOUND
            );
        }

        let total = logs.length;

        if (paged.offset > 0 || total >= paged.limit) {
            total = await this.loggerService.getLogsCount();
        }

        res.status(200).json(
            {
                total,
                returned: logs.length,
                offset: paged.offset,
                limit: paged.limit,
                logs
            }
        );
    }

}