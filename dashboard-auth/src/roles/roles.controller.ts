import {
    Get,
    Put,
    Res,
    Req,
    Body,
    Post,
    Query,
    Param,
    Delete,
    UseGuards,
    HttpStatus,
    Controller,
    HttpException,
} from "@nestjs/common";
import {
    ApiTags,
    ApiBody,
    ApiQuery,
    ApiResponse,
    ApiOperation,
    ApiBearerAuth,
} from "@nestjs/swagger";
import { Response } from "express";
import { ROLE } from "../enums/enum";
import { Role } from '../schemas/roles.schema'
import { RolesService } from "./roles.service";
import { AuthUser } from "../types/auth-user.type";
import { MessageResponse } from "../types/response.type";
import { JoiValidationPipe } from "../pipes/validation.pipe";
import { AuthGuard } from "../security/auth-guard/auth.guard";
import { RoleDecorator } from "../security/auth-guard/auth.decorator";
import { JoiValidationSchema } from "../validations/schema.validation";

@ApiTags('Roles Controllers - Internal')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('roles')
export class RolesController {

    constructor(
        private rolesService: RolesService
    ) { }


    @ApiOperation(
        {
            summary: 'Create role(s)',
            description: 'Users with `internal` set to true and `Owner` or `Super Admin` as their role can create roles within the system and assign them for general use'
        }
    )
    @ApiResponse(
        {
            status: 201,
            type: MessageResponse
        }
    )
    @ApiBody(
        {
            schema: {
                properties: {
                    role: {
                        type: 'string',
                        description: 'Mention the name of the role to be added'
                    }
                },
                example: { role: 'Manager' }
            }
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN)
    @Post()
    async createRole(
        @Req() req,
        @Res() res: Response,
        @Body(new JoiValidationPipe(JoiValidationSchema.roleSchema)) payload: Role
    ) {

        const { internal } = <AuthUser>req.user;

        if (!internal) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        payload.role = payload.role.toLowerCase().trim();

        const isAlreadyExist = await this.rolesService.getByRole(payload.role);

        if (isAlreadyExist) {
            throw new HttpException(
                `Role with name: ${payload.role} already exist`,
                HttpStatus.CONFLICT
            );
        }

        const response = await this.rolesService.create(payload);

        if (!response) {
            throw new HttpException(
                `Failed to create`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(201).json(
            {
                message: `Role with name: ${payload.role} created successfully`
            }
        );

    }


    @ApiOperation(
        {
            summary: 'Get Roles',
            description: 'Get all the roles'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: [Role]
        }
    )
    // @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN, ROLE.MASTER_ADMIN)
    @Get()
    async getRoles(
        @Res() res: Response
    ) {
        const response = await this.rolesService.getRoles();

        if (!response) {
            throw new HttpException(
                `Role(s) not found`,
                HttpStatus.NOT_FOUND
            );
        }

        res.status(200).json(response);
    }



    @ApiOperation(
        {
            summary: 'Get role by name',
            description: 'Get role detail by name'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: Role
        }
    )
    // @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN)
    @Get('name')
    async getRoleByName(
        @Res() res: Response,
        @Query('role') role: string
    ) {

        const response = await this.rolesService.getByRole(role.toLowerCase());

        if (!response) {
            throw new HttpException(
                `Role with name: ${role} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        res.status(200).json(response);
    }



    @ApiOperation(
        {
            summary: 'Get role by ID',
            description: 'Get role detail by ID'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: Role
        }
    )
    // @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN)
    @Get(':id')
    async getRoleById(
        @Res() res: Response,
        @Query('id') id: string
    ) {

        const response = await this.rolesService.getByRoleId(id);

        if (!response) {
            throw new HttpException(
                `Role with id: ${id} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        res.status(200).json(response);
    }



    @ApiOperation(
        {
            summary: 'Update role by role ID',
            description: 'Update role by role ID, accessible only to users with `internal` as true and roles `Owner` or `Super Admin`'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse
        }
    )
    @ApiBody(
        {
            schema: {
                properties: {
                    role: {
                        type: 'string',
                        description: 'Mention the name of the role to be updated'
                    }
                },
                example: { role: 'Manager' }
            }
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN)
    @Put(':id')
    async updateRole(
        @Req() req,
        @Res() res: Response,
        @Param('id') roleId: string,
        @Body('role') roleName: string
    ) {

        const { internal } = <AuthUser>req.user;

        if (!internal) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        const role = await this.rolesService.getByRoleId(roleId);

        if (!role) {
            throw new HttpException(
                `Role with name: ${role} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        roleName = roleName.toLowerCase();

        const isAlreadyExist = await this.rolesService.getByRole(roleName);

        if (isAlreadyExist) {
            throw new HttpException(
                `Role with name: ${role} already exist`,
                HttpStatus.NOT_FOUND
            );
        }

        const response = await this.rolesService.update(roleId, roleName);

        if (!response) {
            throw new HttpException(
                `Role with id: ${roleId} not found or unable to update`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `Role with id: ${roleId} updated successfully`
        });
    }



    @ApiOperation(
        {
            summary: 'Delete role by role ID(s)',
            description: 'Delete role(s) by role ID(s), accessible only to users with `internal` as true and roles `Owner` or `Super Admin`'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse
        }
    )
    @ApiQuery({
        name: 'id',
        required: true
    })
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN)
    @Delete()
    async deleteRoles(
        @Req() req,
        @Res() res: Response,
        @Query('id') roleIds: any
    ) {

        const { internal } = <AuthUser>req.user;

        if (!internal) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }


        if (typeof roleIds === 'string') {
            roleIds = roleIds.split(' ');
        }

        const response = await this.rolesService.deleteRoles(roleIds);

        if (!response) {
            throw new HttpException(
                `Role(s) not found or unable to delete`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `Role with id(s): ${roleIds} deleted successfully`
        });

    }

}