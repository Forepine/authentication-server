import { ApiProperty } from "@nestjs/swagger";

export class Permissions {

    @ApiProperty({ example: 'wallets' })
    module: string;

    @ApiProperty({ example: false })
    create: boolean;

    @ApiProperty({ example: true })
    read: boolean;

    @ApiProperty({ example: false })
    update: boolean;

    @ApiProperty({ example: true })
    delete: boolean;
}