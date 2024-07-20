import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { STATUS } from "../enums/enum";
import { Model, Types } from "mongoose";
import { Paged } from "../types/pagination.type";
import { User, UserDocument } from "../schemas/users.schema";
import { UpdateLoggedInUser, UpdateUserAsAdmin } from "../types/user.type";


@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async create(payload: User): Promise<User> {
        try {
            const response = await this.userModel.create(payload);
            return response.toJSON() as User || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getByEmail(email: string): Promise<User> {
        try {

            const response = await this.userModel.aggregate(
                [
                    {
                        $match: { email }
                    },
                    {
                        $lookup: {
                            from: "roles",
                            localField: "roleId",
                            foreignField: "_id",
                            as: "rolesData"
                        }
                    },
                    {
                        $unwind: {
                            path: "$rolesData"
                        }
                    },
                    {
                        $project: {
                            userId: "$_id",
                            orgId: 1,
                            email: 1,
                            password: 1,
                            bankId: 1,
                            status: 1,
                            head: 1,
                            role: "$rolesData.role",
                            permissions: 1,
                            isTwoFactorAuthenticationEnabled: 1,
                            twoFactorAuthenticationSecret: 1,
                            internal: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            _id: 0
                        }
                    }
                ]
            );

            return response[0] as User || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getById(orgId: string, userId: string): Promise<User> {
        try {

            const filter = {
                $or: [
                    { orgId: orgId ? orgId : '' },
                    {
                        _id: new Types.ObjectId(userId)
                    }
                ]
            };

            const response = await this.userModel.aggregate(
                [
                    {
                        $match: filter
                    },
                    {
                        $lookup: {
                            from: 'roles',
                            localField: 'roleId',
                            foreignField: '_id',
                            as: 'roles'
                        }
                    },
                    {
                        $unwind: {
                            path: '$roles',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            userId: '$_id',
                            _id: 0,
                            orgId: 1,
                            email: 1,
                            roleId: 1,
                            bankId: 1,
                            role: '$roles.role',
                            name: 1,
                            status: 1,
                            permissions: 1,
                            isBankUser: 1,
                            isTwoFactorAuthenticationEnabled: 1,
                            head: 1,
                            internal: 1,
                            createdAt: 1,
                            updatedAt: 1
                        }
                    }
                ]
            );

            return response[0] as User || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getUsersByOrgId(orgId: string, paged: Paged): Promise<User[]> {
        try {

            const response = await this.userModel.aggregate(
                [
                    {
                        $match: {
                            // orgId: orgId ? orgId : { $exists: true }
                            orgId
                        }
                    },
                    {
                        $lookup: {
                            from: "roles",
                            localField: "roleId",
                            foreignField: "_id",
                            as: "rolesData"
                        }
                    },
                    {
                        $unwind: {
                            path: "$rolesData"
                        }
                    },
                    {
                        $project: {
                            userId: '$_id',
                            orgId: 1,
                            email: 1,
                            name: 1,
                            status: 1,
                            bankId: 1,
                            head: 1,
                            permissions: 1,
                            role: '$rolesData.role',
                            isTwoFactorAuthenticationEnabled: 1,
                            internal: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            _id: 0,
                        }
                    },
                    {
                        $skip: paged.offset
                    },
                    {
                        $limit: paged.limit
                    }
                ]
            );

            return response as unknown as User[] || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getUserDetailByEmail(email: string): Promise<User> {
        try {
            const response = await this.userModel.aggregate(
                [
                    {
                        $match: {
                            email
                        }
                    },
                    {
                        $lookup: {
                            from: "roles",
                            localField: "roleId",
                            foreignField: "_id",
                            as: "roles"
                        }
                    },
                    {
                        $unwind: {
                            path: "$roles"
                        }
                    },
                    {
                        $lookup: {
                            from: "organizations",
                            localField: "orgId",
                            foreignField: "orgId",
                            as: "org"
                        }
                    },
                    {
                        $unwind: {
                            path: "$org",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: "banks",
                            localField: "bankId",
                            foreignField: "bankId",
                            as: "banks"
                        }
                    },
                    {
                        $unwind: {
                            path: "$banks",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            email: 1,
                            name: 1,
                            orgId: 1,
                            userId: 1,
                            banks: 1,
                            bankName: {
                                $ifNull: ["$banks.bankName", null]
                            },
                            bankId: {
                                $ifNull: ["$banks.bankId", null]
                            },
                            bankStatus: {
                                $ifNull: ["$banks.status", null]
                            },
                            isDeleted: {
                                $ifNull: ["$banks.isDeleted", null]
                            },
                            role: "$roles.role",
                            orgStatus: "$org.status",
                            password: 1,
                            permissions: 1,
                            roleId: 1,
                            isBankUser: 1,
                            status: 1,
                            head: 1,
                            // permissionId: 1,
                            isTwoFactorAuthenticationEnabled: 1,
                            twoFactorAuthenticationSecret: 1,
                            internal: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        }
                    },
                    {
                        $addFields: {
                            bankName: {
                                $ifNull: ["$banks.bankName", null]
                            },
                            bankId: {
                                $ifNull: ["$banks.bankId", null]
                            },
                            bankStatus: {
                                $ifNull: ["$banks.bankStatus", null]
                            },
                            isDeleted: {
                                $ifNull: ["$banks.isDeleted", null]
                            },
                        }
                    }
                ]
            );

            return response ? response[0] as User : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    // async getOrgUsersCount(orgId: string) {
    //     try {
    //         const response = await this.userModel.aggregate(
    //             [
    //                 {
    //                     $match: { orgId }
    //                 },
    //                 {
    //                     $count: "total"
    //                 }
    //             ]
    //         );

    //         return response.length || null;
    //     } catch (error) {
    //         console.error(`Something went wrong: ${error}`);
    //         return null;
    //     }
    // }

    async updateById(orgId: string, userId: string, payload: UpdateLoggedInUser): Promise<boolean> {
        try {
            const filter = { orgId, _id: Types.ObjectId.createFromHexString(userId) };

            const response = await this.userModel.updateOne(filter, payload);
            return response.modifiedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    // soft delete
    async deleteById(orgId: string, userId: string): Promise<boolean> {
        try {
            const filter = { orgId, _id: userId };

            const response = await this.userModel.updateOne(filter, {
                $set: {
                    status: STATUS.DEACTIVE,
                    isDeleted: true,
                    deletedAt: new Date().toISOString()
                }
            });
            return response.modifiedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async deleteOrgUsers(orgId: string): Promise<boolean> {
        try {
            const filter = { orgId };

            const response = await this.userModel.updateMany(filter, {
                $set: {
                    status: STATUS.DEACTIVE,
                    isDeleted: true,
                    deletedAt: new Date().toISOString()
                }
            });

            return response.modifiedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async updatePassword(userId: string, password: string): Promise<boolean> {
        try {

            const filter = { _id: userId };

            const response = await this.userModel.updateOne(filter, {
                $set: {
                    password
                }
            });

            return response.modifiedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    // ----- OWNER(PLUTOS), BOU/COU ---------

    async getAllUser(paged: Paged, plutosUsersOnly: boolean, isBankUser: boolean): Promise<User[]> {
        try {

            const isInternal = typeof plutosUsersOnly == 'string' && plutosUsersOnly == 'true' ? true : false;

            const matchCondition = [];

            if (isInternal) {
                matchCondition.push({ internal: true });
            } else if (isBankUser) {
                matchCondition.push({ isBankUser: false, internal: false });
            } else {
                matchCondition.push({ isBankUser: { $exists: true }, internal: false });
            }

            const response = await this.userModel.aggregate(
                [
                    {
                        $match: {
                            $or: matchCondition
                        }
                    },
                    {
                        $lookup: {
                            from: "roles",
                            localField: "roleId",
                            foreignField: "_id",
                            as: "rolesData"
                        }
                    },
                    {
                        $unwind: {
                            path: "$rolesData"
                        }
                    },
                    {
                        $project: {
                            userId: "$_id",
                            orgId: 1,
                            name: 1,
                            email: 1,
                            roleId: 1,
                            status: 1,
                            head: 1,
                            bankId: 1,
                            role: "$rolesData.role",
                            isBankUser: 1,
                            permissions: 1,
                            isTwoFactorAuthenticationEnabled: 1,
                            internal: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            _id: 0
                        }
                    },
                    {
                        $skip: paged.offset
                    },
                    {
                        $limit: paged.limit
                    }
                ]
            );

            return response ? response as User[] : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async updateUserById(userId: string, payload: UpdateUserAsAdmin): Promise<boolean> {
        try {
            const filter = { _id: Types.ObjectId.createFromHexString(userId) };

            const response = await this.userModel.updateOne(filter, { roleId: payload.role, ...payload });

            return response.modifiedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getTotalUsercount(): Promise<number> {
        try {
            const response = await this.userModel.countDocuments();
            return response ? response : 0;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async deleteUserById(userId: string[]): Promise<boolean> {
        try {
            const response = await this.userModel.deleteMany({ _id: userId });
            return response.deletedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    // TWO FACTOR AUTHENTICATION 
    async setTwoFactorAuthenticationSecret(secret: string, userId: string | Types.ObjectId): Promise<boolean> {
        try {
            const response = await this.userModel.updateOne({ _id: userId }, {
                $set: {
                    twoFactorAuthenticationSecret: secret,
                },
            });

            return response.modifiedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async enableTwoFactorAuthentication(userId: string | Types.ObjectId): Promise<boolean> {
        try {

            const response = await this.userModel.updateOne({ _id: userId }, {
                $set: {
                    isTwoFactorAuthenticationEnabled: true
                },
            });

            return response.modifiedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }
}
