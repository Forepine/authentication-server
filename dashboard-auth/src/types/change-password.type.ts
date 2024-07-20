import { ApiProperty } from "@nestjs/swagger";

export class ChangePassword {

    @ApiProperty({ example: '******' })
    password: string;

    @ApiProperty({ example: '******' })
    confirmPassword: string;
}