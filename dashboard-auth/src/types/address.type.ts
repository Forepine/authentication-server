import { ApiProperty } from "@nestjs/swagger";

export class Address {

    @ApiProperty({ required: false, example: 'Main Street' })
    street: string;

    @ApiProperty({ required: false, example: 'New Delhi' })
    city: string;

    @ApiProperty({ required: false, example: 'Delhi' })
    state: string;

    @ApiProperty({ required: false, example: 110022 })
    pinCode: number;
}