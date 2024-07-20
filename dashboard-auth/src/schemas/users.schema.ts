import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, {
    Document,
    Types,
    Schema as MongooseSchema
} from "mongoose";
import { STATUS } from "../enums/enum";
import { ApiProperty } from "@nestjs/swagger";
import { Permissions } from "../types/permissions.type";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {

    _id: Types.ObjectId | string;

    @ApiProperty({ example: 'NET9A1A' })
    @Prop({ index: true })
    orgId: string;


    @ApiProperty({ example: 'PNB@08698' })
    @Prop({ type: mongoose.Types.ObjectId, ref: 'Bank' })
    bankId?: string;


    @ApiProperty({ example: 'email@email.com' })
    @Prop({ lowercase: true })
    email: string;


    @ApiProperty({ example: 'John Doe' })
    @Prop()
    name: string;


    @ApiProperty({ example: '******' })
    @Prop({ min: 2, max: 100 })
    password: string;


    @ApiProperty({ example: '668cc8a86a4010dc1483c854' })
    @Prop({ type: mongoose.Types.ObjectId, ref: 'Role' })
    roleId: mongoose.Types.ObjectId | string;


    @ApiProperty({ example: STATUS })
    @Prop()
    status: STATUS;


    @ApiProperty({ example: false })
    @Prop({ default: null })
    head: boolean;


    @ApiProperty({ example: Permissions })
    @Prop({ type: MongooseSchema.Types.Mixed })
    permissions: Permissions[] | boolean;


    @ApiProperty({ example: false })
    @Prop({ default: false })
    internal: boolean;


    @ApiProperty({ example: false })
    @Prop({ default: false })
    isBankUser: boolean;


    @ApiProperty({ example: 'FQNV4GQ3CVBCOQK3' })
    @Prop()
    twoFactorAuthenticationSecret: string;


    @ApiProperty({ example: false, default: false })
    @Prop({ default: false })
    isTwoFactorAuthenticationEnabled: boolean;


    @ApiProperty()
    @Prop({ default: false })
    isDeleted: boolean;


    @ApiProperty()
    @Prop()
    deletedAt: Date;

}

export const userSchema = SchemaFactory.createForClass(User);