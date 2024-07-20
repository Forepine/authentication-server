import { ORGANIZATION_TYPE, STATUS } from "../enums/enum";

export class AuthUser {

    orgId: string;
    userId: string;
    bankId: string;
    name: string;
    email: string;
    roleId: string;
    role: string;
    head: boolean;
    status: STATUS;
    isBankUser: boolean;
    internal: boolean;
    type: ORGANIZATION_TYPE;
    companyName: string;
    gst: string;
    scopes: string;
    phone: number;
    client_key: string;
    client_secret: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    isTwoFactorAuthenticationEnabled: boolean;
}

