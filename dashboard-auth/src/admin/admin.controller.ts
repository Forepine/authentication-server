import {
    Get,
    Put,
    Req,
    Res,
    Body,
    Query,
    Param,
    Patch,
    Delete,
    UseGuards,
    Controller,
    HttpStatus,
    HttpException,
} from "@nestjs/common";
import { Response } from "express";
import { ROLE } from "../enums/enum";
import { Utility } from "../helpers/utils";
import { User } from "../schemas/users.schema";
import { Paged } from "../types/pagination.type";
import { AuthUser } from "../types/auth-user.type";
import { RolesService } from "../roles/roles.service";
import { UsersService } from "../users/users.service";
import { JoiValidationPipe } from "../pipes/validation.pipe";
import { AuthGuard } from "../security/auth-guard/auth.guard";
import { Organization } from "../schemas/organizations.schema";
import { RoleDecorator } from "../security/auth-guard/auth.decorator";
import { JoiValidationSchema } from "../validations/schema.validation";
import { organizationUpdateAsAdmin } from "../types/organizations.type";
import { OrganizationService } from "../organizations/organizations.service";
import { MessageResponse, TableFormatResponse } from "../types/response.type";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { MongoValidationPipe } from "../pipes/mongoid.pipe";
import { UpdateUserAsAdmin } from "../types/user.type";

@ApiTags('Admin Controllers')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('admin')
export class AdminController {

    constructor(
        private util: Utility,
        private usersService: UsersService,
        private rolesService: RolesService,
        private orgService: OrganizationService,
    ) { }


    // -------- ORGANIZATIONS --------

    @ApiOperation(
        {
            summary: 'Get detail of all organization',
            description: 'Get the organizations details as `Owner` `Super Admin` and `Master Admin` of the account',
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: [Organization]
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN, ROLE.MASTER_ADMIN, ROLE.ADMIN)
    @Get('organizations')
    async getOrganizations(
        @Req() req,
        @Res() res: Response,
        @Query(new JoiValidationPipe(JoiValidationSchema.paginationSchema)) paged: Paged,
    ) {

        const { internal, isBankUser } = <AuthUser>req.user;

        if (!internal && !isBankUser) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        paged.offset = +paged.offset || 0;
        paged.limit = +paged.limit || 10;

        const organizations = await this.orgService.getOrganizations(paged);

        if (!organizations || organizations.length < 1) {
            throw new HttpException(
                `Organization(s) does not exist`,
                HttpStatus.NOT_FOUND
            );
        }


        let total = organizations.length;

        // Get count from DB if total is more then limit set
        if (paged.offset > 0 || total >= paged.limit) {
            total = await this.orgService.getOrganizationsCount();
        }

        res.status(200).json({
            total,
            returned: organizations.length,
            offset: +paged.offset,
            limit: +paged.limit,
            organizations
        });

    }


    @ApiOperation(
        {
            summary: 'Get organization detail by organization ID',
            description: 'Get the organization detail by orgId as `Owner` `Super Admin` and `Master Admin` of the account',

        }
    )
    @ApiResponse(
        {
            status: 200,
            type: Organization
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN, ROLE.MASTER_ADMIN, ROLE.ADMIN)
    @Get('organizations/:id')
    async getOrganizationById(
        @Req() req,
        @Res() res: Response,
        @Param('id') orgId: string
    ) {

        const { internal, isBankUser } = <AuthUser>req.user;

        if (!internal && !isBankUser) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        const response = await this.orgService.getOrganizationById(orgId);

        if (!response) {
            throw new HttpException(
                `Organization with id: ${orgId} does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        res.status(200).json(response);
    }


    @ApiOperation(
        {
            summary: 'Update an organization detail by organization ID',
            description: 'Update the organization detail by orgId as `Owner` `Super Admin` and `Master Admin` of the account',

        }
    )
    @ApiResponse(
        {
            status: 200,
            type: String,
            description: `Organization with id(s): 'orgId' updated successfully`
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN, ROLE.MASTER_ADMIN, ROLE.ADMIN)
    @Put('organizations/:id')
    async updateOrganizationById(
        @Req() req,
        @Res() res: Response,
        @Param('id') orgId: string,
        @Body(new JoiValidationPipe(JoiValidationSchema.updateOrganizationAsAdminSchema)) payload: organizationUpdateAsAdmin
    ) {

        const { internal, isBankUser } = <AuthUser>req.user;

        if (!internal && !isBankUser) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        const org = await this.orgService.getOrganizationById(orgId);

        if (!org) {
            throw new HttpException(
                `Organization with id: ${orgId} does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        const response = await this.orgService.updateOrganizationById(orgId, payload);

        if (!response) {
            throw new HttpException(
                `Failed to update organization with id: ${orgId}`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `Organization with id: ${orgId} updated successfully`
        });

    }


    @ApiOperation(
        {
            summary: 'Delete an organization by organization ID(s)',
            description: 'Delete(Soft) an organization by orgId as `Owner` `Super Admin` and `Master Admin` of the account',

        }
    )
    @ApiResponse(
        {
            status: 200,
            type: String,
            description: `Organization with id(s): 'orgId' deleted successfully`
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN, ROLE.MASTER_ADMIN, ROLE.ADMIN)
    @Delete('organizations')
    async deleteOrganizationByIds(
        @Req() req,
        @Res() res: Response,
        @Query('id') orgIds: any
    ) {

        const { internal, isBankUser } = <AuthUser>req.user;

        if (!internal && !isBankUser) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        if (typeof orgIds === 'string') {
            orgIds = orgIds.split(' ');
        }

        const response = await this.orgService.deleteOrganizationById(orgIds);

        if (!response) {
            throw new HttpException(
                `Organization with id(s): ${orgIds} does not exist`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `Organization with id(s): ${orgIds} deleted successfully`
        });

    }


    @ApiOperation(
        {
            summary: 'Update Client Secret of an organization by organization ID',
            description: 'Update Client Secret of an organization by orgId as `Owner` `Super Admin` and `Master Admin` of the account and PLUTOS AND BANK as Entity',

        }
    )
    @ApiResponse(
        {
            status: 200,
            type: String,
            description: `Client-Secret updated successfully`
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN, ROLE.MASTER_ADMIN, ROLE.ADMIN)
    @Patch('organizations/:id')
    async updateClientSecret(
        @Req() req,
        @Res() res: Response,
        @Param('id') orgId: string
    ) {

        const { internal, isBankUser } = <AuthUser>req.user;

        if (!internal && !isBankUser) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        const org = await this.orgService.getOrganizationById(orgId);

        if (!org) {
            throw new HttpException(
                `Organization with id: ${orgId} does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        const { clientSecret } = await this.util.generateRandomClientCredential();

        const response = await this.orgService.updateClientSecret(orgId, clientSecret);

        if (!response) {
            throw new HttpException(
                `Failed to update client secret, try again`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: 'Client-Secret updated successfully'
        });

    }

    // --------- USERS ---------

    @ApiOperation(
        {
            summary: 'Get users of all organization or plutos have',
            description: 'Get users of all organization as `Owner` `Super Admin` and `Master Admin` of the account & add `internal`(logged in as plutos user only) to get users of plutos',

        }
    )
    @ApiResponse(
        {
            status: 200,
            type: TableFormatResponse,
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN, ROLE.MASTER_ADMIN, ROLE.ADMIN)
    @Get('users')
    async getUsers(
        @Req() req,
        @Res() res: Response,
        @Query(new JoiValidationPipe(JoiValidationSchema.paginationSchema)) paged: Paged,
    ) {

        const { internal, isBankUser } = <AuthUser>req.user;

        if (!internal && !isBankUser) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        if (!internal && paged.internal) {
            throw new HttpException(
                `You don't have permission to access Plutos users`,
                HttpStatus.BAD_REQUEST
            );
        }

        paged.offset = +paged.offset || 0;
        paged.limit = +paged.limit || 10;

        const users = await this.usersService.getAllUser(paged, paged.internal, isBankUser);

        if (!users || users.length < 1) {
            throw new HttpException(
                `Users not found`,
                HttpStatus.NOT_FOUND
            );
        }

        let total = users.length;

        // Get count from DB if total is more then limit set
        if (paged.offset > 0 || total >= paged.limit) {
            total = await this.usersService.getTotalUsercount();
        }

        res.status(200).json({
            total,
            returned: users.length,
            offset: paged.offset,
            limit: paged.limit,
            users
        });

    }


    @ApiOperation(
        {
            summary: `Get user by user's email`,
            description: 'Get user detail by user email as `Owner` `Super Admin` and `Master Admin` of the account',

        }
    )
    @ApiResponse(
        {
            status: 200,
            type: User,
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN, ROLE.MASTER_ADMIN, ROLE.ADMIN)
    @Get('users/email')
    async getUserByEmail(
        @Req() req,
        @Res() res: Response,
        @Query('email') email: string,
    ) {

        const { internal, isBankUser } = <AuthUser>req.user;

        if (!internal && !isBankUser) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        const user = await this.usersService.getByEmail(email);

        if (!user) {
            throw new HttpException(
                `User with email: ${email} does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        user.password = undefined;

        res.status(200).json(user);

    }


    @ApiOperation(
        {
            summary: `Update an user by user ID`,
            description: 'Update an user detail by user id as `Owner`, `Super Admin` and `Master Admin` of the account',

        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse,
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.MASTER_ADMIN, ROLE.SUPER_ADMIN, ROLE.ADMIN)
    @Put('users/:id')
    async updateUserById(
        @Req() req,
        @Res() res: Response,
        @Param('id', new MongoValidationPipe) userId: string,
        @Body(new JoiValidationPipe(JoiValidationSchema.updateUserAsAdminSchema)) payload: UpdateUserAsAdmin
    ) {

        const { userId: id, internal, isBankUser } = <AuthUser>req.user;

        if (!internal && !isBankUser) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        if (id === userId) {
            throw new HttpException(
                `Admin(s) can not update itself from this API`,
                HttpStatus.BAD_REQUEST
            );
        }

        const user = await this.usersService.getById('', userId);

        if (!user) {
            throw new HttpException(
                `User with id: ${userId} does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        // Get role and update based on roleId
        const role = await this.rolesService.getByRole(payload.role.toLowerCase());

        if (!role) {
            throw new HttpException(
                `Role with name: ${payload.role} does not exist, please contact Plutos`,
                HttpStatus.NOT_FOUND
            );
        }

        // Change the permission to true if role is either SA, Admin, or MA
        if (payload.role === ROLE.SUPER_ADMIN || payload.role === ROLE.MASTER_ADMIN || payload.role === ROLE.ADMIN) {
            payload.permissions = true;
        }

        payload.role = role.roleId;

        const response = await this.usersService.updateUserById(userId, payload);

        if (!response) {
            throw new HttpException(
                `User with id: ${userId} not updated`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `User with id: ${userId} updated successfully`
        });
    }


    @ApiOperation(
        {
            summary: `Delete user by user ID(s)`,
            description: 'Delete user(s) detail by user ID(s) as `Owner` `Super Admin` and `Master Admin` of the account',

        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse,

        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN, ROLE.MASTER_ADMIN, ROLE.ADMIN)
    @Delete('users')
    async deleteUser(
        @Req() req,
        @Res() res: Response,
        @Query('id') ids: any,
    ) {

        const { userId: id, internal, isBankUser } = <AuthUser>req.user;

        if (!internal && !isBankUser) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        if (typeof ids == 'string') {
            ids = ids.split(' ');
        }

        if (ids.includes(id)) {
            throw new HttpException(
                `Admin(s) can not delete itself from this API`,
                HttpStatus.BAD_REQUEST
            );
        }

        const response = await this.usersService.deleteUserById(ids);

        if (!response) {
            throw new HttpException(
                `User with id(s): ${ids} does not exist or not deleted`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `User with id(s): ${ids} deleted successfully`
        });
    }

}
