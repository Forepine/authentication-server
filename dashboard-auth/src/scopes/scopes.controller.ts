import {
    Res,
    Put,
    Req,
    Get,
    Body,
    Post,
    Query,
    Param,
    Delete,
    UseGuards,
    Controller,
    HttpStatus,
    HttpException,
} from "@nestjs/common";
import {
    ApiTags,
    ApiResponse,
    ApiOperation,
} from "@nestjs/swagger";
import { Response } from "express";
import { ROLE } from "../enums/enum";
import { Scope } from "../schemas/scopes.schema";
import { ScopesService } from "./scopes.service";
import { Paged } from "../types/pagination.type";
import { AuthUser } from "../types/auth-user.type";
import { MessageResponse } from "../types/response.type";
import { MongoValidationPipe } from "../pipes/mongoid.pipe";
import { AuthGuard } from "../security/auth-guard/auth.guard";
import { RoleDecorator } from "../security/auth-guard/auth.decorator";

@ApiTags('Scopes Controllers - Internal')
@UseGuards(AuthGuard)
@Controller('scopes')
export class ScopesController {

    constructor(
        private scopesService: ScopesService
    ) { }


    @ApiOperation(
        {
            summary: 'Create Scopes',
            description: 'Logged in user with `Internal` as true and role as `Owner` `Super Admin` & `Admin` can create scopes'
        }
    )
    @ApiResponse(
        {
            status: 201,
            type: Scope
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN, ROLE.ADMIN)
    @Post()
    async createScope(
        @Req() req,
        @Res() res: Response,
        @Body() payload: Scope
    ) {

        const { internal } = <AuthUser>req.user;

        if (!internal) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        payload.scopeName = payload.scopeName.toLowerCase().trim();

        const isAlreadyExist = await this.scopesService.getScopeByName(payload.scopeName);

        if (isAlreadyExist) {
            throw new HttpException(
                `Scope with name: ${payload.scopeName} already exist`,
                HttpStatus.BAD_REQUEST
            );
        }

        const response = await this.scopesService.addScope(payload);

        if (!response) {
            throw new HttpException(
                `Failed to add new scope`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(201).json(response);

    }



    @ApiOperation(
        {
            summary: 'Get Scopes',
            description: 'Logged in user can get list of scopes'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: [Scope]
        }
    )
    @Get()
    async getScopes(
        @Res() res: Response,
        @Query() paged: Paged
    ) {

        paged.offset = +paged.offset || 0;
        paged.limit = +paged.limit || 10;

        const scopes = await this.scopesService.getScopes(paged);

        if (!scopes) {
            throw new HttpException(
                `Scopes does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        let total = scopes.length;

        // Get count from DB if total is more then limit set
        if (paged.offset > 0 || total >= paged.limit) {
            total = await this.scopesService.getTotalScopescount();
        }

        res.status(200).json({
            total,
            returned: scopes.length,
            offset: paged.offset,
            limit: paged.limit,
            scopes
        });

    }



    @ApiOperation(
        {
            summary: 'Get Scope by ID',
            description: 'Logged in user can get scope detail by ID'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: Scope
        }
    )
    @Get(':id')
    async getScopeById(
        @Res() res: Response,
        @Param('id', new MongoValidationPipe) id: string
    ) {

        const scope = await this.scopesService.getScopeById(id);

        if (!scope) {
            throw new HttpException(
                `Scope with id: ${id} does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        res.status(200).json(scope);

    }



    @ApiOperation(
        {
            summary: 'Update Scope by ID',
            description: 'Logged in user with `Internal` as true and role with `Owner` `Super Admin` & `Admin` can update scope detail by ID'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN, ROLE.ADMIN)
    @Put(':id')
    async updateScopeById(
        @Res() res: Response,
        @Param('id', new MongoValidationPipe) id: string,
        @Body() payload: Scope
    ) {

        const scope = await this.scopesService.getScopeById(id);

        if (!scope) {
            throw new HttpException(
                `Scope with id: ${id} does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        payload.scopeName = payload.scopeName.toLowerCase().trim();

        const isAlreadyExist = await this.scopesService.getScopeByName(payload.scopeName);

        if (isAlreadyExist) {
            throw new HttpException(
                `Scope with name: ${payload.scopeName} already exist`,
                HttpStatus.CONFLICT
            );
        }

        payload._id = id;

        const response = await this.scopesService.updateScopeById(payload);

        if (!response) {
            throw new HttpException(
                `Failed to update scope`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json(
            {
                message: `Scope with id: ${id} updated successfully`
            }
        );
    }



    @ApiOperation(
        {
            summary: 'Delete Scope by ID(s)',
            description: 'Logged in user with `Internal` as true and role with `Owner` `Super Admin` & `Admin` can delete scope detail by ID(s)'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN, ROLE.ADMIN)
    @Delete()
    async deleteScopesById(
        @Res() res: Response,
        @Query('id') ids: any
    ) {

        if (typeof ids === 'string') {
            ids = ids.split(' ');
        }

        const response = await this.scopesService.deleteScopeById(ids);

        if (!response) {
            throw new HttpException(
                `Failed to deleted scopes with id(s): ${ids}`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json(
            {
                message: `Scope with id(s): ${ids} deleted successfully`
            }
        );

    }

}