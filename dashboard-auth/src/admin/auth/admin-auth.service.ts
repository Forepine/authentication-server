import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../../schemas/users.schema";

@Injectable()
export class AdminAuthService {

    constructor(
        @InjectModel(User.name) private userModel: Model<User>
    ) { }

    async create(payload: User) {
        try {
            const response = await new this.userModel(payload).save();
            return response || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getByEmail(email: string): Promise<User> {
        try {
            const response = await this.userModel.findOne({ email });
            return response as User || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getUserFullDetailByEmail(email: string): Promise<User> {
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
                            as: "roles"
                        }
                    },
                    {
                        $unwind: {
                            path: '$roles',
                        }
                    },
                    {
                        $project: {
                            orgId: 1,
                            email: 1,
                            name: 1,
                            role: '$roles.role',
                            password: 1,
                            bankId: 1,
                            roleId: 1,
                            status: 1,
                            head: 1,
                            permissionId: 1,
                            internal: 1,
                            isTwoFactorAuthenticationEnabled: 1,
                            twoFactorAuthenticationSecret: 1,
                            createdAt: 1,
                            updatedAt: 1
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
}