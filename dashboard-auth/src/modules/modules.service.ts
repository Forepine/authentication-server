import mongoose, { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Module } from "../schemas/modules.schema";
import { Module as ModuleType } from '../types/modules.type'

@Injectable()
export class ModulesService {

    constructor(
        @InjectModel(Module.name) private moduleModel: Model<Module>
    ) { }

    async create(payload: ModuleType): Promise<mongoose.Types.ObjectId | string> {
        try {
            const response = await this.moduleModel.create({ moduleName: payload.module });
            return response ? response._id : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getModules(): Promise<Module[]> {
        try {
            const response = await this.moduleModel.find({}, { __v: 0 });
            return response ? response as Module[] : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getModuleById(moduleId: string): Promise<Module> {
        try {
            const filter = { _id: moduleId }
            const response = await this.moduleModel.findById(filter, { __v: 0 });
            return response || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getModuleByName(module: string): Promise<Module> {
        try {
            const filter = { moduleName: module }
            const response = await this.moduleModel.findOne(filter, { __v: 0 });
            return response ? response as Module : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async updateModule(moduleId: string, module: string): Promise<boolean> {
        try {
            const filter = { _id: moduleId }
            const response = await this.moduleModel.updateOne(filter, { moduleName: module });
            return response.modifiedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async deleteModules(moduleIds: string[]): Promise<boolean> {
        try {
            const filter = { _id: moduleIds }
            const response = await this.moduleModel.deleteMany(filter);
            return response.deletedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }
}