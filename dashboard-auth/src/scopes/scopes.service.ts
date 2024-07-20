import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Paged } from "../types/pagination.type";
import { Scope } from "../schemas/scopes.schema";

@Injectable()
export class ScopesService {

    constructor(
        @InjectModel(Scope.name) private scopeModel: Model<Scope>,
    ) { }

    async addScope(payload: Scope): Promise<Scope> {
        try {
            const response = await this.scopeModel.create({ scopeName: payload.scopeName });
            return response ? response as Scope : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getScopes(paged: Paged): Promise<Scope[]> {
        try {
            const response = await this.scopeModel
                .find({}, { __v: 0 })
                .skip(paged.offset)
                .limit(paged.limit);

            return response ? response as Scope[] : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getScopeById(scopeId: string): Promise<Scope> {
        try {
            const response = await this.scopeModel.findById({ _id: scopeId }, { __v: 0 });

            return response ? response as Scope : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getScopeByName(scopeName: string): Promise<Scope> {
        try {
            const response = await this.scopeModel.findOne({ scopeName }, { __v: 0 });

            return response ? response as Scope : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getTotalScopescount() {
        try {
            const response = await this.scopeModel.countDocuments();

            return response ? response : 0;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async updateScopeById(payload: Scope): Promise<boolean> {
        try {

            const filter = { _id: payload._id }
            const response = await this.scopeModel.updateOne(filter, { scopeName: payload.scopeName });

            return response.modifiedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async deleteScopeById(ids: string[]): Promise<boolean> {
        try {
            const filter = { _id: ids }
            const response = await this.scopeModel.deleteMany(filter);

            return response.deletedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }
}