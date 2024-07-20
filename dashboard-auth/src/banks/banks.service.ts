import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Bank } from "../schemas/banks.schema";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../schemas/users.schema";
import { Paged } from "../types/pagination.type";
import { BankUser } from "../types/bank.type";

@Injectable()
export class BanksService {

    constructor(
        @InjectModel(Bank.name) private banksModel: Model<Bank>,
        @InjectModel(User.name) private usersModel: Model<User>,
    ) { }

    async createBank(payload: Bank): Promise<Bank> {
        try {
            const response = await this.banksModel.create(payload);

            return response.toJSON() as Bank || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getBankByName(name: string): Promise<Bank> {
        try {
            const filter = { bankName: name };

            const response = await this.banksModel.findOne(filter, { __v: 0 });
            return response as Bank || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getBankById(bankId: string): Promise<Bank> {
        try {
            const filter = { bankId };

            const response = await this.banksModel.findOne(filter, { __v: 0 });
            return response as Bank || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async updateBankById(bankId: string, payload: any): Promise<boolean> {
        try {
            const response = await this.banksModel.updateOne({ bankId }, payload);
            return response.modifiedCount > 0 || false;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }


    // BANK USERS
    async createBankUser(payload: BankUser | any): Promise<User> {
        try {
            const response = await this.usersModel.create(payload);
            return response.toJSON() as User || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }


    async getBankUsers(bankId: string, paged: Paged): Promise<User[]> {
        try {

            const response = await this.usersModel.aggregate(
                [
                    {
                        $match: {
                            bankId,
                            isBankUser: true
                        }
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
                            path: '$roles'
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            bankId: 1,
                            email: 1,
                            name: 1,
                            role: '$roles.role',
                            status: 1,
                            head: 1,
                            permissions: 1,
                            internal: 1,
                            isBankUser: 1,
                            // twoFactorAuthenticationSecret: 1,
                            isTwoFactorAuthenticationEnabled: 1,
                            isDeleted: 1,
                            deletedAt: 1,
                            createdAt: 1,
                            updatedAt: 1,
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

            return response as User[] || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }


    async getBankUsersCount() {
        try {
            const response = await this.usersModel.aggregate(
                [
                    {
                        $match: { isBankUser: true } // don't need to match with bankId since every bank has own database & server
                    },
                    {
                        $count: "total"
                    }
                ]
            );

            return response[0].total || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

}