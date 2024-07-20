
import { STATUS } from "../enums/enum";
import { Address } from "./address.type";
import { ApiProperty } from "@nestjs/swagger";
import { Permissions } from "./permissions.type";

export class BankUser {

    @ApiProperty({ required: true })
    name: string;

    @ApiProperty({ required: true })
    email: string;

    @ApiProperty({ required: true })
    password: string;

    @ApiProperty({ required: true })
    role: string;

    @ApiProperty({ required: true })
    status: STATUS = STATUS.ACTIVE;

    @ApiProperty({ required: true, type: [Permissions] || Boolean })
    permissions: Permissions[] | boolean;

    @ApiProperty({ required: true })
    isBankUser: boolean = true;
}



export class RegisterBank {

    @ApiProperty({ required: false })
    bankName: string;

    @ApiProperty({ required: false })
    branch: string;

    @ApiProperty({ required: false })
    address: Address;

    @ApiProperty({ required: true })
    name: string;

    @ApiProperty({ required: true })
    email: string;

    @ApiProperty({ required: true })
    password: string;
}

export class UpdateBank {

    @ApiProperty({ example: 'Punjab National Bank' })
    bankName: string;

    @ApiProperty({ example: 'JanakPuri' })
    branch: string;

    @ApiProperty({ example: Address, required: false })
    address: Address;
}