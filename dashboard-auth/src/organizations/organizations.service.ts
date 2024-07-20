import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { STATUS } from "../enums/enum";
import { Paged } from "../types/pagination.type";
import { Organization } from "../schemas/organizations.schema";
import { organizationUpdate, organizationUpdateAsAdmin } from "../types/organizations.type";

@Injectable()
export class OrganizationService {

    constructor(
        @InjectModel(Organization.name) private orgModel: Model<Organization>
    ) { }

    async create(payload: Organization): Promise<Organization> {
        try {
            const response = await this.orgModel.create(payload);
            return response ? response as Organization : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    // For Logged In User(s)
    async getOrganization(orgId: string): Promise<Organization> {
        try {

            const response = await this.orgModel.aggregate(
                [
                    {
                        $match: {
                            orgId
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            // let: { head: "$head" },
                            // pipeline: [
                            //     {
                            //         $match: {
                            //             head: true
                            //         }
                            //     }
                            // ],
                            // as: "users"
                            localField: 'orgId',
                            foreignField: 'orgId',
                            as: 'users'
                        }
                    },
                    {
                        $project: {
                            orgId: 1,
                            bankId: 1,
                            companyName: 1,
                            gst: 1,
                            phone: 1,
                            type: 1,
                            status: 1,
                            scopes: 1,
                            clientKey: 1,
                            clientSecret: 1,
                            address: 1,
                            users: { $size: "$users" },
                            createdAt: 1,
                            updatedAt: 1,
                            _id: 0
                        }
                    }
                ]
            );

            return response ? response[0] as Organization : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getOrganizationByName(companyName: string): Promise<Organization> {
        try {
            const response = await this.orgModel.findOne({ companyName });
            return response ? response as Organization : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getOrganizationByGST(gst: string): Promise<Organization> {
        try {
            const response = await this.orgModel.findOne({ gst });
            return response ? response as Organization : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getOrganizationByClientCredential(clientKey: string, clientSecret: string): Promise<Organization> {
        try {

            const filter = { clientKey, clientSecret };

            const response = await this.orgModel.findOne(filter, { __v: 0 });
            return response as Organization || null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async deleteOrganization(orgId: string): Promise<boolean> {
        try {
            const response = await this.orgModel.updateOne({ orgId }, {
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

    async updateOrganization(orgId: string, payload: organizationUpdate): Promise<boolean> {
        try {

            payload.scopes = payload.scopes?.toString().replace(/([,]+)/g, ' ').trim();

            const response = await this.orgModel.updateOne({ orgId }, payload);
            return response.modifiedCount > 0 || false;

        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    // ------For Owner(Plutos), Master Admin(BOU/COU), Super Admin-------

    // For Owner(Plutos) & BOU/COU
    async getOrganizations(paged: Paged): Promise<Organization[]> {
        try {

            const response = await this.orgModel
                .aggregate(
                    [
                        {
                            $lookup: {
                                from: "users",
                                localField: "orgId",
                                foreignField: "orgId",
                                as: "users"
                            }
                        },
                        {
                            $unwind: {
                                path: "$users",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $group: {
                                _id: "$_id",
                                orgId: { $first: "$orgId" },
                                bankId: { $first: "$bankId" },
                                companyName: { $first: "$companyName" },
                                gst: { $first: "$gst" },
                                phone: { $first: "$phone" },
                                type: { $first: "$type" },
                                status: { $first: "$status" },
                                scopes: { $first: "$scopes" },
                                clientKey: { $first: "$clientKey" },
                                clientSecret: { $first: "$clientSecret" },
                                address: { $first: "$address" },
                                createdAt: { $first: "$createdAt" },
                                updatedAt: { $first: "$updatedAt" },
                                email: {
                                    $first: {
                                        $cond: {
                                            if: { $eq: ["$users.head", true] },
                                            then: "$users.email",
                                            else: null
                                        }
                                    }
                                },
                                usersCount: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                orgId: 1,
                                bankId: 1,
                                email: 1,
                                companyName: 1,
                                gst: 1,
                                phone: 1,
                                type: 1,
                                status: 1,
                                scopes: 1,
                                clientKey: 1,
                                clientSecret: 1,
                                address: 1,
                                usersCount: 1,
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

            return response ? response as Organization[] : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    // For Owner(Plutos) & BOU/COU
    async getOrganizationById(orgId: string): Promise<Organization> {
        try {
            const response = await this.orgModel.aggregate(
                [
                    {
                        $match: {
                            orgId
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: 'orgId',
                            foreignField: 'orgId',
                            as: "users"
                        }
                    },
                    {
                        $project: {
                            orgId: 1,
                            bankId: 1,
                            email: 1,
                            companyName: 1,
                            gst: 1,
                            phone: 1,
                            type: 1,
                            status: 1,
                            scopes: 1,
                            clientKey: 1,
                            clientSecret: 1,
                            address: 1,
                            users: { $size: "$users" },
                            createdAt: 1,
                            updatedAt: 1,
                            _id: 0
                        }
                    }
                ]
            );

            return response ? response[0] as Organization : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    // For Owner(Plutos) & BOU/COU
    async updateOrganizationById(orgId: string, payload: organizationUpdateAsAdmin): Promise<boolean> {
        try {

            payload.scopes = payload.scopes?.toString().replace(/([,]+)/g, ' ').trim();

            const response = await this.orgModel.updateOne({ orgId }, payload);
            return response ? response.modifiedCount > 0 : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    // For Owner(Plutos) & BOU/COU (SOFT DELETE)
    async deleteOrganizationById(orgIds: string[]): Promise<boolean> {
        try {
            const response = await this.orgModel.updateMany({ orgId: orgIds },
                {
                    status: STATUS.DEACTIVE,
                    isDeleted: true,
                    deletedAt: new Date().toISOString()
                }
            );
            return response ? response.modifiedCount > 0 : null;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    async getOrganizationsCount(): Promise<number> {
        try {
            const response = await this.orgModel.countDocuments().exec();
            return response || 0;
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
            return null;
        }
    }

    // ----FOR ALL--------
    async updateClientSecret(orgId: string, clientSecret: string): Promise<boolean> {
        try {
            const filter = { orgId };
            const response = await this.orgModel.updateOne(filter, { clientSecret });
            return response ? response.modifiedCount > 0 : false;
        } catch (error) {
            throw error.detail;
        }
    }

}