import { ApiProperty } from "@nestjs/swagger";

export class Paged {

    @ApiProperty({ required: false })
    offset: number = 0;

    @ApiProperty({ required: false })
    limit: number = 10;

    @ApiProperty({ required: false })
    search?: string;

    @ApiProperty({ required: false })
    internal?: boolean;
}