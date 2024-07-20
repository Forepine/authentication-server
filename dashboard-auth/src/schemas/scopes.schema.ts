import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document, Types } from "mongoose";

export type ScopeDocument = Document<Scope>

@Schema({ timestamps: true, versionKey: false })
export class Scope {

    @ApiProperty({ required: false, example: '668cc8a86a4010dc1483c854', type: 'string' })
    _id: Types.ObjectId | string;

    @ApiProperty({ example: 'read_bills' })
    @Prop({ lowercase: true })
    scopeName: string;

}

export const ScopeSchema = SchemaFactory.createForClass(Scope);