import mongoose from "mongoose";
import { ROLE, STATUS } from "../enums/enum";
import { ApiProperty } from "@nestjs/swagger";
import { Permissions } from '../types/permissions.type'

class ValidUser {

    @ApiProperty({ required: false, example: '668d1cacae42e52ff2666a56' })
    _id: mongoose.Types.ObjectId | string;

    @ApiProperty({ required: true, example: 'John Doe' })
    name: string;

    @ApiProperty({ required: true, example: 'email@email.com' })
    email: string;

    @ApiProperty({ required: true, example: '******' })
    password: string;

    @ApiProperty({ required: false, enum: STATUS, default: STATUS.ACTIVE })
    status: STATUS;

    @ApiProperty({ required: false, default: false, example: false })
    head: boolean;

    @ApiProperty({ required: false, default: ROLE.OWNER, example: ROLE.OWNER })
    role: string;

    @ApiProperty({ required: false, example: null })
    orgId: string;

    @ApiProperty({ required: false, example: null })
    bankId: string;

    @ApiProperty({ required: false, example: false })
    isBankUser: boolean;

    @ApiProperty({ required: false, example: false })
    isDeleted: boolean = false;

    @ApiProperty({ required: false, example: '668e2c452dc10b0db1d5a50d' })
    roleId: mongoose.Types.ObjectId | string;

    @ApiProperty({ required: false, default: true, example: Permissions })
    permissions: Permissions[] | boolean;

    @ApiProperty({ required: false, default: true, example: true })
    internal: boolean;

    @ApiProperty({ required: false, example: 'EAGBUZQICBZGSLDS' })
    twoFactorAuthenticationSecret: string;

    @ApiProperty({ required: false, default: false, example: false })
    isTwoFactorAuthenticationEnabled: boolean;

    @ApiProperty({ required: false })
    deletedAt: Date;
}


class UpdateUserAsAdmin {

    @ApiProperty({ example: STATUS.ACTIVE })
    status: STATUS;

    @ApiProperty({ example: 'Developer' })
    role: string | any;

    @ApiProperty({ example: [Permissions] })
    permissions?: Permissions[] | boolean;
}

class UpdateLoggedInUser {

    @ApiProperty({ example: 'Smith Eva' })
    name: string;
}

export {
    ValidUser,
    UpdateLoggedInUser,
    UpdateUserAsAdmin,
}