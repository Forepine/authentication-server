import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document, Types } from "mongoose";

export type RoleDocument = Document<Role>

@Schema(
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            transform: (doc, ret) => {
                ret.roleId = ret._id;
                delete ret._id;
            },
        },
        toObject: {
            versionKey: false
        },
    },


)
export class Role {

    @ApiProperty({ example: '668d0932c38c7ce4abe95268' })
    roleId?: Types.ObjectId | string;

    @ApiProperty({ example: 'Manager' })
    @Prop({ index: true })
    role: string;

}

export const roleSchema = SchemaFactory.createForClass(Role);