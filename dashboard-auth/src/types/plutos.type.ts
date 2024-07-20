import mongoose from "mongoose";
import { STATUS } from "../enums/enum";
import { Permissions } from "./permissions.type";
import { ApiProperty } from "@nestjs/swagger";

export class PlutosUser {

    @ApiProperty({ example: 'Sumit Verma' })
    name: string;

    @ApiProperty({ example: 'sumit@plutos.one' })
    email: string;

    @ApiProperty({ example: '******' })
    password: string;

    @ApiProperty({ example: STATUS.ACTIVE, default: STATUS.ACTIVE })
    status: STATUS;

    @ApiProperty({ example: false })
    head: boolean;

    @ApiProperty({ example: false })
    isBankUser: boolean;

    @ApiProperty({ example: 'Developer' })
    role: string;

    @ApiProperty({ example: '66910b18540419e686ae9cc9' })
    roleId?: mongoose.Types.ObjectId;

    @ApiProperty({ example: [Permissions] })
    permissions: Permissions[] | boolean;

    @ApiProperty({ example: true })
    internal: boolean;

    @ApiProperty({ example: null })
    twoFactorAuthenticationSecret: string;

    @ApiProperty({ example: false })
    isTwoFactorAuthenticationEnabled: boolean;
}