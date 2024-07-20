import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Log } from "../schemas/logs.schema";
import { Paged } from "../types/pagination.type";

@Injectable()
export class LoggersService {

    constructor(
        @InjectModel(Log.name) private loggersModel: Model<Log>,
    ) { }

    async createLog(payload: any): Promise<Log> {
        try {
            const response = await this.loggersModel.create(payload);
            return response || null;
        } catch (error) {
            console.error(`Something went wrong: ${error.message}`);
            return;
        }
    }

    async readLogs(paged: Paged): Promise<Log[]> {
        try {

            const searchQuery: any = {};

            if (paged.search) {
                const searchRegex = new RegExp(paged.search, 'i');
                searchQuery.$or = [
                    { route: { $regex: searchRegex } },
                    { method: { $regex: searchRegex } }
                ];
            }

            const response = await this.loggersModel.find(searchQuery ? searchQuery : {}, { __v: 0, _id: 0 })
                .skip(paged.offset)
                .limit(paged.limit)
                .sort({ timestamp: -1 })
                .lean();

            return response ? response as Log[] : [];
        } catch (error) {
            console.error(`Something went wrong: ${error.message}`);
            return;
        }
    }

    async getLogsCount(): Promise<number> {
        try {

            const response = await this.loggersModel.countDocuments();

            return response ? response : 0;
        } catch (error) {
            console.error(`Something went wrong: ${error.message}`);
            return;
        }
    }


}