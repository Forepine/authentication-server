import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document, Types } from "mongoose";

export type ModuleDocument = Document<Module>

@Schema({ timestamps: true, versionKey: false })
export class Module {

    @ApiProperty({ example: 'transactions' })
    @Prop()
    moduleName: string;

}

export const moduleSchema = SchemaFactory.createForClass(Module);