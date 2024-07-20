import { ApiProperty } from "@nestjs/swagger";

export class Signin {

    @ApiProperty({ required: true, example: 'email@email.com' })
    email: string;

    @ApiProperty({ required: true, example: '******' })
    password: string;

}