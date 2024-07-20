import {
    Get,
    Req,
    Res,
    Body,
    Post,
    Put,
    Query,
    Patch,
    Delete,
    UseGuards,
    HttpStatus,
    Controller,
    HttpException,
    Param,
} from "@nestjs/common";
import {
    ApiTags,
    ApiResponse,
    ApiOperation,
    ApiBearerAuth,
} from "@nestjs/swagger";
import { Response } from "express";
import { Utility } from "../helpers/utils";
import { ROLE, STATUS } from "../enums/enum";
import { UsersService } from "./users.service";
import { User } from "../schemas/users.schema";
import { Paged } from "../types/pagination.type";
import { AuthUser } from "../types/auth-user.type";
import { RolesService } from "../roles/roles.service";
import { MongoValidationPipe } from "../pipes/mongoid.pipe";
import { JoiValidationPipe } from "../pipes/validation.pipe";
import { AuthGuard } from "../security/auth-guard/auth.guard";
import { ChangePassword } from "../types/change-password.type";
import { RoleDecorator } from "../security/auth-guard/auth.decorator";
import { JoiValidationSchema } from "../validations/schema.validation";
import { MessageResponse, TableFormatResponse } from "../types/response.type";
import { UpdateLoggedInUser, UpdateUserAsAdmin, ValidUser } from "../types/user.type";

@ApiTags('Users Controllers')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {

    constructor(
        private util: Utility,
        private usersService: UsersService,
        private rolesService: RolesService,
    ) { }


    @ApiOperation(
        {
            summary: 'Add User(s)',
            description: 'Logged in user either `Super Admin` or `Admin` of an `organization` can add users in an organization, not for `Banks` and `Plutos`'
        }
    )
    @ApiResponse(
        {
            status: 201,
            type: User,
        }
    )
    @RoleDecorator(ROLE.SUPER_ADMIN, ROLE.ADMIN)
    @Post()
    async create(
        @Req() req,
        @Res() res: Response,
        @Body(new JoiValidationPipe(JoiValidationSchema.usersSchema)) payload: ValidUser
    ) {

        const { orgId, internal } = <AuthUser>req.user;

        if (internal) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        const user = await this.usersService.getByEmail(payload.email);

        if (user) {
            throw new HttpException(
                `User with email: ${payload.email} already exist`,
                HttpStatus.CONFLICT
            );
        }

        const hash = await this.util.encryptPassword(payload.password);

        payload.role = payload.role.toLowerCase();
        // Get roles
        const isRoleAlreadyInDB = await this.rolesService.getByRole(payload.role);

        // create role if not exist in db
        const roleId = isRoleAlreadyInDB ? isRoleAlreadyInDB.roleId : await this.rolesService.create(payload);

        // set permissions to true for super admin
        const permission = payload.role === ROLE.SUPER_ADMIN ? true : payload.permissions;

        payload._id = null;
        payload.orgId = orgId;
        payload.name = payload.name;
        payload.email = payload.email;
        payload.roleId = roleId;
        payload.password = hash;
        payload.status = STATUS.ACTIVE;
        payload.permissions = permission;
        payload.head = false;
        payload.internal = false;
        payload.isBankUser = false;
        payload.twoFactorAuthenticationSecret = null;
        payload.isTwoFactorAuthenticationEnabled = false;
        payload.isDeleted = false;
        payload.deletedAt = null;

        const response = await this.usersService.create(payload);

        if (!response) {
            throw new HttpException(
                `Failed to create user`,
                HttpStatus.BAD_REQUEST
            );
        }

        response.password = undefined;

        res.status(201).json(response);

    }


    @ApiOperation(
        {
            summary: 'Update User Account detail',
            description: 'Endpoint for Organization `Super Admin` & `Admin` user to update other user\s details within an organization'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse,
        }
    )
    @RoleDecorator(ROLE.SUPER_ADMIN, ROLE.ADMIN)
    @Put(':id')
    async updateUserAsAdmin(
        @Req() req,
        @Res() res: Response,
        @Param('id', new MongoValidationPipe) id: string,
        @Body(new JoiValidationPipe(JoiValidationSchema.updateUserAsAdminSchema)) payload: UpdateUserAsAdmin
    ) {

        const { orgId } = <AuthUser>req.user;

        if (!orgId) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        const user = await this.usersService.getById(orgId, id);

        if (!user) {
            throw new HttpException(
                `User with id: ${id} does not exist`,
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
        if (payload.role === ROLE.SUPER_ADMIN || payload.role === ROLE.ADMIN) {
            payload.permissions = true;
        }

        const response = await this.usersService.updateUserById(orgId, payload);

        if (!response) {
            throw new HttpException(
                `Failed to update user`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `User with id: ${id} updated successfully`
        });

    }


    @ApiOperation(
        {
            summary: 'Get Users',
            description: 'Logged in user can get all the users exist in an organization if the user is either `Super Admin` or `Admin` of an `organization`, not for `Banks` and `Plutos`'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: TableFormatResponse,
        }
    )
    @RoleDecorator(ROLE.SUPER_ADMIN, ROLE.ADMIN)
    @Get()
    async getAll(
        @Req() req,
        @Res() res: Response,
        @Query(new JoiValidationPipe(JoiValidationSchema.paginationSchema)) paged: Paged
    ) {

        paged.offset = +paged.offset || 0;
        paged.limit = +paged.limit || 10;

        const { orgId } = <AuthUser>req.user;

        const users = await this.usersService.getUsersByOrgId(orgId, paged);

        if (!users) {
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
            offset: +paged.offset,
            limit: +paged.limit,
            users
        });

    }


    @ApiTags('Common Controllers')
    @ApiOperation(
        {
            summary: 'Update your account',
            description: 'Endpoint for logged-in user to update account'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse,
        }
    )
    @Patch()
    async update(
        @Req() req,
        @Res() res: Response,
        @Body(new JoiValidationPipe(JoiValidationSchema.updateSelfSchema)) payload: UpdateLoggedInUser
    ) {

        const { orgId, userId } = <AuthUser>req.user;

        const user = await this.usersService.getById(orgId, userId);

        if (!user) {
            throw new HttpException(
                `User with id: ${userId} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        const response = await this.usersService.updateById(orgId, userId, payload);

        if (!response) {
            throw new HttpException(
                `Update failed`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `User with id: ${userId} updated successfully`
        });

    }


    @ApiTags('Common Controllers')
    @ApiOperation(
        {
            summary: 'Delete your account',
            description: 'Endpoint for logged-in user to delete(soft) account'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse,
        }
    )
    @Delete()
    async delete(
        @Req() req,
        @Res() res: Response
    ) {

        const { orgId, userId } = <AuthUser>req.user;

        const response = await this.usersService.deleteById(orgId, userId);

        if (!response) {
            throw new HttpException(
                `User not exist`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `User with id: ${userId} deleted successfully`
        });
    }


    @ApiTags('Common Controllers')
    @ApiOperation(
        {
            summary: 'Get your profile',
            description: 'Endpoint for logged-in user to get profile detail'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: User,
        }
    )
    @Get('me')
    async getProfile(
        @Req() req,
        @Res() res: Response,
    ) {

        const { orgId, userId } = <AuthUser>req.user;

        const user = await this.usersService.getById(orgId, userId);

        if (!user) {
            throw new HttpException(
                `User with id: ${userId} does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        user.password = undefined;

        res.status(200).json(user);
    }


    @ApiTags('Common Controllers')
    @ApiOperation(
        {
            summary: 'Change current password',
            description: 'Endpoint for logged-in user to request a password change'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: 'object',
        }
    )
    @UseGuards(AuthGuard)
    @Patch('change-password')
    async changePassword(
        @Req() req,
        @Res() res: Response,
        @Body(new JoiValidationPipe(JoiValidationSchema.changePasswordSchema)) payload: ChangePassword
    ) {

        const { userId } = <AuthUser>req.user;

        if (payload.password !== payload.confirmPassword) {
            throw new HttpException(
                `Password & Confirm Password are not matched`,
                HttpStatus.BAD_REQUEST
            );
        }

        const hash = await this.util.encryptPassword(payload.password);

        const response = await this.usersService.updatePassword(userId, hash);

        if (!response) {
            throw new HttpException(
                `Password did not updated`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `Password updated successfully`
        });

    }

}