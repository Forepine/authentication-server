import { STATUS } from "../enums/enum";
import { Address } from "./address.type";
import { ORGANIZATION_TYPE } from "../enums/enum";
import { ApiProperty } from "@nestjs/swagger";

class OrgSignup {

    @ApiProperty({ example: 'QW238DJ0FCD3EDL' })
    gst: string;

    @ApiProperty({ example: 'John Doe' })
    name: string;

    @ApiProperty({ example: 9898989898 })
    phone: number;

    @ApiProperty({ example: 'email@email.com' })
    email: string;

    @ApiProperty({ example: '******' })
    password: string;

    @ApiProperty({ required: false, example: Address })
    address: Address;

    @ApiProperty({ example: ["read_bills", "read_packs", "read_billers"] })
    scopes: string[];

    @ApiProperty({ example: 'Example Company' })
    companyName: string;

    @ApiProperty({ example: ORGANIZATION_TYPE })
    type: ORGANIZATION_TYPE;

    @ApiProperty({ example: 'PNB@08698' })
    bankId: string;
}


class organizationUpdate {

    @ApiProperty({ example: 'Netflix Private Limited' })
    companyName: string;

    @ApiProperty({ example: ["read_bills", "read_operator_circle"] })
    scopes: string;

    @ApiProperty({ example: Address })
    address: Address;

    @ApiProperty({ example: 9898989898 })
    phone: string;
}

class organizationUpdateAsAdmin {

    @ApiProperty({ required: true })
    scopes: string;

    @ApiProperty({ required: true, enum: STATUS })
    status: STATUS;
}

export {
    OrgSignup,
    organizationUpdate,
    organizationUpdateAsAdmin,
}