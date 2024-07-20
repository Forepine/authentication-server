import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { STATUS } from "../enums/enum";
import { ApiProperty } from "@nestjs/swagger";
import { Address } from "../types/address.type";

export type BanksDocument = Bank & Document;

@Schema({
    toJSON: {
        versionKey: false,
    },
    toObject: {
        versionKey: false,
    },
    timestamps: true
})
export class Bank {

    @ApiProperty({ example: 'PNB@08698', required: false })
    @Prop({ index: true })
    bankId: string;

    @ApiProperty({ example: 'Punjab National Bank' })
    @Prop()
    bankName: string;

    @ApiProperty({ example: 'Janak Puri' })
    @Prop()
    branch: string;

    @ApiProperty({ default: STATUS.ACTIVE, required: false })
    @Prop({ default: STATUS.ACTIVE })
    status: STATUS;

    @ApiProperty({ example: Address, required: false })
    @Prop()
    address?: Address;

    @ApiProperty({ default: false, required: false })
    @Prop({ default: false })
    isDeleted: boolean;

    @ApiProperty({ required: false })
    @Prop({ type: Date })
    deletedAt?: Date;

}

export const banksSchema = SchemaFactory.createForClass(Bank);