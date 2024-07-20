import { ApiProperty } from "@nestjs/swagger";

export class ClientCredential {

    @ApiProperty({ example: 'b83c2d4d-bbf9-4a8c-a828-24142baf506d' })
    clientKey: string;

    @ApiProperty({ example: '$2b$10$OlhqQRsldp04H/pGqmoLr.y8cJSq07tdUPLecnhkSStMrGgRtQJiy' })
    clientSecret: string;

    @ApiProperty({ example: ["read_operator_circle", "create_transactions"] })
    scopes: string;
}