import { ApiProperty } from "@nestjs/swagger";
import { ORGANIZATION_TYPE, STATUS } from "../enums/enum";
import { Permissions } from "./permissions.type";
import { String } from "aws-sdk/clients/codebuild";

class LoginResponse {

    @ApiProperty()
    token: string;

    @ApiProperty()
    expiredIn: string;

    @ApiProperty()
    issuedAt: Date
}

class TwoFAResponse {

    @ApiProperty()
    message: string;

    @ApiProperty()
    QRCode: string;

    @ApiProperty()
    secret: Date
}

class BankSignupResponse {

    @ApiProperty()
    _id: string;

    @ApiProperty()
    userId: String;

    @ApiProperty()
    bankId: string;

    @ApiProperty()
    bankName: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    roleId: string;

    @ApiProperty()
    branch: string;

    @ApiProperty({ default: STATUS.ACTIVE })
    status: STATUS;

    @ApiProperty()
    head: boolean;

    @ApiProperty({ default: true })
    permissions: boolean;

    @ApiProperty({ default: false })
    internal: boolean;

    @ApiProperty({ default: true })
    isBankUser: boolean;

    @ApiProperty({ default: false })
    isDeleted: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    twoFactorAuthenticationSecret: string;

    @ApiProperty({ default: false })
    isTwoFactorAuthenticationEnabled: boolean;

}

class TableFormatResponse {

    @ApiProperty()
    total: number;

    @ApiProperty()
    returned: number;

    @ApiProperty()
    offset: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    data: any
}


class OrganizationRegisterResponse {

    @ApiProperty({ example: '668cbf226e12ec83e058dee8' })
    _id: string;

    @ApiProperty({ example: 'PNB9A1A' })
    orgId: string;

    @ApiProperty({ example: 'PNB@08698' })
    bankId: string;

    @ApiProperty({ example: 'ABC Company' })
    companyName: string;

    @ApiProperty({ example: 9898989898 })
    phone: number;

    @ApiProperty({ example: 'QW238DJ0FCD3EDL' })
    gst: string;

    @ApiProperty({ example: ORGANIZATION_TYPE })
    type: ORGANIZATION_TYPE;

    @ApiProperty({ default: STATUS.ACTIVE, example: ORGANIZATION_TYPE })
    status: STATUS;

    @ApiProperty({ example: '0ba6840e-fad7-49e6-9e9f-ecd2d05b3989' })
    clientKey: string;

    @ApiProperty({ example: '$2b$10$6ZaBo8YOd1w4hZ14f0NRo.iRj3JCIm9evV3zSMGFvGiy.N2dP3TVq' })
    clientSecret: string;

    @ApiProperty({ example: 'read_bills read_packs read_billers read_operator_circle' })
    scopes: string;

    @ApiProperty({ example: 'email@email.com' })
    email: string;

    @ApiProperty({ example: 'John Doe' })
    name: string;

    @ApiProperty({ example: '668cbf226e12ec83e058dee8' })
    roleId: string;

    @ApiProperty({ example: true })
    head: boolean;

    @ApiProperty({ example: true })
    permissions: boolean;

    @ApiProperty({ default: false, example: false })
    internal: boolean;

    @ApiProperty({ default: false, example: false })
    isBankUser: boolean;

    @ApiProperty({ default: false, example: false })
    isDeleted: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty({ default: null, example: 'EAGBUZQICBZGSLDS' })
    twoFactorAuthenticationSecret: string;

    @ApiProperty({ default: false, example: false })
    isTwoFactorAuthenticationEnabled: boolean;
}


class MessageResponse {

    @ApiProperty()
    message: string;
}

export {
    LoginResponse,
    TwoFAResponse,
    MessageResponse,
    BankSignupResponse,
    TableFormatResponse,
    OrganizationRegisterResponse
}