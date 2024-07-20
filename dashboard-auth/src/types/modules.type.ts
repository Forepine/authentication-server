import { ApiProperty } from "@nestjs/swagger";

export class Module {

    @ApiProperty({ example: 'Wallets' })
    module: string;
}