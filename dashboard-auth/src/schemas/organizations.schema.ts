import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Address } from "../types/address.type";
import { ORGANIZATION_TYPE, STATUS } from "../enums/enum";

export type OrganizationDocument = Document<Organization>

@Schema({ timestamps: true, versionKey: false })
export class Organization {

    @ApiProperty({ required: false, example: 'HDFE7RE' })
    @Prop({ index: true })
    orgId: string;

    @ApiProperty({ required: false, example: 'HDFC@08698' })
    @Prop()
    bankId: string;

    @ApiProperty({ required: true, example: 'SWDE23VFGT5' })
    @Prop()
    billerId?: string;

    @ApiProperty({ required: true, example: 'Netflix Private Limited' })
    @Prop({ min: 2, max: 100 })
    companyName: string;

    @ApiProperty({ required: true, example: 'QW238DJ0FC03EDL' })
    @Prop({ minlength: 15, maxlength: 15 })
    gst: string;

    @ApiProperty({ required: false, example: Address })
    @Prop()
    address: Address;

    @ApiProperty({ required: true, example: 9898989898 })
    @Prop()
    phone: number;

    @ApiProperty({ required: true, example: ORGANIZATION_TYPE.AI })
    @Prop()
    type: ORGANIZATION_TYPE;

    @ApiProperty({ required: false, default: STATUS.ACTIVE })
    @Prop()
    status: STATUS;

    @ApiProperty({ required: true, example: ["read_bills", "read_operator_circle"] })
    @Prop()
    scopes: string;

    @ApiProperty({ required: false, example: 'b83c2d4d-bbf9-4a8c-a828-24142baf506d' })
    @Prop()
    clientKey: string;

    @ApiProperty({ required: false, example: '$2b$10$OlhqQRsldp04H/pGqmoLr.y8cJSq07tdUPLecnhkSStMrGgRtQJiy' })
    @Prop()
    clientSecret: string;

    @ApiProperty({ required: false, example: false })
    @Prop({ default: false })
    isDeleted: boolean;

    @ApiProperty({ required: false })
    @Prop({ type: Date })
    deletedAt: Date;

}

export const organizationSchema = SchemaFactory.createForClass(Organization);

