import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document, Types } from "mongoose";

export type LogsDocument = Log & Document;

@Schema()
export class Log {

    @ApiProperty({ example: 'GET', required: false })
    @Prop()
    method: string;

    @ApiProperty({ example: 'v1/api/users', required: false })
    @Prop()
    route: string;

    @ApiProperty({ example: '127.168.0.1', required: false })
    @Prop()
    ip: string;

    @ApiProperty({ example: 'John Doe', required: false })
    @Prop({ required: false })
    user: string;

    @ApiProperty({ example: 'email@email.com', required: false })
    @Prop({ required: false })
    email: string;

    @ApiProperty({ example: 'Admin', required: false })
    @Prop({ required: false })
    role: string;

    @ApiProperty({ required: false })
    @Prop({ type: Date, default: Date.now })
    timestamp?: Date;


    // more keys to add on requirement

}

export const logsSchema = SchemaFactory.createForClass(Log);