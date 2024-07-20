import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Types } from "mongoose";
import { Role } from "../schemas/roles.schema";


@Injectable()
export class RolesService {

    constructor(
        @InjectModel(Role.name) private roleModel: Model<Role>
    ) { }


    async create(payload: Role): Promise<string | mongoose.Types.ObjectId> {
        try {
            const response = await new this.roleModel({ role: payload.role }).save();

            return response ? response._id : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getByRole(role: string): Promise<Role> {
        try {

            const response = await this.roleModel.aggregate(
                [
                    {
                        $match: { role }
                    },
                    {
                        $project: {
                            roleId: '$_id',
                            role: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            _id: 0
                        }
                    }
                ]
            );

            return response[0] as Role || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getByRoleId(roleId: string): Promise<Role> {
        try {
            const filter = { _id: new Types.ObjectId(roleId) }

            const response = await this.roleModel.aggregate(
                [
                    {
                        $match: filter
                    },
                    {
                        $project: {
                            roleId: '$_id',
                            role: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            _id: 0
                        }
                    }
                ]
            );

            return response[0] as Role || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getRoles(): Promise<Role[]> {
        try {

            const response = await this.roleModel.aggregate(
                [
                    {
                        $project: {
                            roleId: '$_id',
                            role: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            _id: 0
                        }
                    }
                ]
            );

            return response as Role[] || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async deleteRoles(roleIds: string[]): Promise<boolean> {
        try {
            const filter = { _id: roleIds }
            const response = await this.roleModel.deleteMany(filter);

            return response.deletedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async update(roleId: string, role: string): Promise<boolean> {
        try {
            const filter = { _id: roleId }
            const response = await this.roleModel.updateOne(filter, { role: role });

            return response.modifiedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }
}