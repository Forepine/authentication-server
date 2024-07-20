import {
    Res,
    Put,
    Req,
    Post,
    Body,
    Get,
    Query,
    UseGuards,
    HttpStatus,
    Controller,
    HttpException,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags
} from "@nestjs/swagger";
import { Response } from "express";
import { Utility } from "../helpers/utils";
import { ROLE, STATUS } from "../enums/enum";
import { Signin } from "../types/signin.type";
import { Bank } from "../schemas/banks.schema";
import { User } from "../schemas/users.schema";
import { BanksService } from "./banks.service";
import { Paged } from "../types/pagination.type";
import { AuthUser } from "../types/auth-user.type";
import { UsersService } from "../users/users.service";
import { RolesService } from "../roles/roles.service";
import { JoiValidationPipe } from "../pipes/validation.pipe";
import { AuthGuard } from "../security/auth-guard/auth.guard";
import { RoleDecorator } from "../security/auth-guard/auth.decorator";
import { JoiValidationSchema } from "../validations/schema.validation";
import { BankUser, RegisterBank, UpdateBank } from "../types/bank.type";
import { BankSignupResponse, LoginResponse, TableFormatResponse } from "../types/response.type";

// This module is belongs to BANKS only

@ApiTags('Banks Controllers')
@ApiBearerAuth()
@Controller()
export class BanksController {

    constructor(
        private util: Utility,
        private banksService: BanksService,
        private usersService: UsersService,
        private rolesService: RolesService,
    ) { }


    @ApiOperation(
        {
            summary: 'Register an account as Bank',
            description: 'Register as Bank, default role as `Master Admin`'
        }
    )
    @ApiResponse(
        {
            status: 201,
            type: BankSignupResponse
        }
    )
    @Post('auth/banks/register')
    async register(
        @Res() res: Response,
        @Body(new JoiValidationPipe(JoiValidationSchema.registerBankSchema)) payload: RegisterBank
    ) {

        const user = await this.usersService.getByEmail(payload.email);

        if (user) {
            throw new HttpException(
                `Account with email: ${payload.email} already exist`,
                HttpStatus.CONFLICT
            );
        }

        const bank = await this.banksService.getBankByName(payload.bankName);

        if (bank) {
            throw new HttpException(
                `Bank with name: ${payload.bankName} already exist`,
                HttpStatus.CONFLICT
            );
        }

        const bankId = `${payload.bankName.slice(0, 3).toUpperCase()}@${this.util.generateRandomCharacter(5)}`;

        const bankPayload = {
            bankId,
            bankName: payload.bankName,
            address: payload?.address,
            branch: payload.branch,
            status: STATUS.ACTIVE,
            isDeleted: false,
        }

        const bankResponse = await this.banksService.createBank(bankPayload);

        if (!bankResponse) {
            throw new HttpException(
                `Bank not created`,
                HttpStatus.BAD_REQUEST
            );
        }

        const hash = await this.util.encryptPassword(payload.password);

        // Get roles
        const isRoleAlreadyInDB = await this.rolesService.getByRole(ROLE.MASTER_ADMIN);

        const roleId = isRoleAlreadyInDB ? isRoleAlreadyInDB.roleId : await this.rolesService.create({ role: ROLE.MASTER_ADMIN });

        const userPayload = {
            _id: null,
            orgId: null,
            bankId,
            name: payload.name,
            email: payload.email,
            password: hash,
            roleId,
            status: STATUS.ACTIVE,
            permissions: true,
            isBankUser: true,
            head: true,
            internal: false,
            isDeleted: false,
            deletedAt: null,
            isTwoFactorAuthenticationEnabled: false,
            twoFactorAuthenticationSecret: null
        }

        const userResponse = await this.usersService.create(userPayload);

        if (!userResponse) {
            throw new HttpException(
                `User not created`,
                HttpStatus.BAD_REQUEST
            );
        }

        userResponse.password = undefined;

        res.status(201).json({
            ...bankResponse,
            ...userResponse
        });

    }


    @ApiOperation(
        {
            summary: 'Login to your account & get access token',
            description: 'Login to your account & get access token for futher activites based on your role'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: LoginResponse
        }
    )
    @Post('auth/banks/login')
    async login(
        @Res() res: Response,
        @Body(new JoiValidationPipe(JoiValidationSchema.loginSchema)) payload: Signin
    ) {

        const user = await this.usersService.getUserDetailByEmail(payload.email.toLowerCase());

        if (!user || user.status !== STATUS.ACTIVE) {
            throw new HttpException(
                `User with email: ${payload.email} does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        // make sure only plutos and banks user can login
        if (user.orgId || user.internal) {
            throw new HttpException(
                `This route belongs to Bank's users login only`,
                HttpStatus.BAD_REQUEST
            );
        }

        if (user['banks']['status'] !== STATUS.ACTIVE) {
            throw new HttpException(
                `Bank with id: ${user.bankId} is deactive, please contact Plutos ONE`,
                HttpStatus.BAD_REQUEST
            );
        }

        const decryptedPassword = await this.util.decryptPassword(payload.password, user.password);

        if (!decryptedPassword) {
            throw new HttpException(
                `Incorrect password`,
                HttpStatus.BAD_REQUEST
            );
        }

        const JWTpayload = {
            email: payload.email,
            roleId: user.roleId,
            bankId: user.bankId,
            isBankUser: user.isBankUser,
            name: user.name,
            role: user['role'],
            orgId: user.orgId,
            userId: user['_id'],
            permissions: user.permissions,
            status: user.status,
            internal: user.internal,
            head: user.head,
            isDeleted: user.isDeleted,
            twoFactorAuthenticationSecret: user.twoFactorAuthenticationSecret,
            isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled,
        }

        const token = await this.util.generateJWTToken(JWTpayload);

        const encryptedJwtToken = await this.util.cryptoEncrypt(token);

        res.status(200).json(
            {
                token: encryptedJwtToken,
                expiredIn: process.env.JWT_EXPIRY,
                createdAt: new Date().toISOString(),
            }
        );
    }

    // BANKS OPERATIONS

    @ApiOperation(
        {
            summary: 'Get the detail of Bank',
            description: 'Get bank detail as a logged in user except `Plutos` and `Organization` user'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: Bank
        }
    )
    @UseGuards(AuthGuard)
    @Get('banks')
    async getBankDetail(
        @Req() req,
        @Res() res: Response,
    ) {

        const { bankId, orgId, internal } = <AuthUser>req.user;

        if (orgId || internal) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        const bank = await this.banksService.getBankById(bankId);

        if (!bank || bank.status !== STATUS.ACTIVE) {
            throw new HttpException(
                `Bank with id: ${bankId} does not exist or deactive`,
                HttpStatus.NOT_FOUND
            );
        }

        res.status(200).json(bank);
    }


    @ApiOperation(
        {
            summary: 'Update the detail of Bank',
            description: 'Update bank detail as a logged in user if your role is `Super Admin`, `Master Admin` or `Admin` except `Plutos` and `Organization` user'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: String,
            description: 'Bank with id: `bankId` updated successfully'
        }
    )
    @UseGuards(AuthGuard)
    @RoleDecorator(ROLE.SUPER_ADMIN, ROLE.MASTER_ADMIN, ROLE.ADMIN)
    @Put('banks')
    async update(
        @Req() req,
        @Res() res: Response,
        @Body(new JoiValidationPipe(JoiValidationSchema.updateBankSchema)) payload: UpdateBank
    ) {

        const { bankId, internal, orgId } = <AuthUser>req.user;

        if (internal || orgId) {
            throw new HttpException(
                `You don't have permission to add user in bank`,
                HttpStatus.FORBIDDEN
            );
        }

        const response = await this.banksService.updateBankById(bankId, payload);

        if (!response) {
            throw new HttpException(
                `Not updated, please try again`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `Bank with id: ${bankId} updated successfully`
        });

    }

    // BANK USERS OPERATIONS

    @ApiOperation(
        {
            summary: 'Add new user(s) in Bank',
            description: 'Add new user(s) in bank as a logged in user if your role is `Master Admin` `Super Admin` or `Admin` except `Plutos` and `Organization` user'
        }
    )
    @ApiResponse(
        {
            status: 201,
            type: User,
        }
    )
    @UseGuards(AuthGuard)
    @RoleDecorator(ROLE.MASTER_ADMIN, ROLE.SUPER_ADMIN, ROLE.ADMIN)
    @Post('banks/users')
    async addUser(
        @Req() req,
        @Res() res: Response,
        @Body(new JoiValidationPipe(JoiValidationSchema.addBankUserSchema)) payload: BankUser
    ) {

        const { bankId, internal, orgId } = <AuthUser>req.user;

        if (internal || orgId) {
            throw new HttpException(
                `You don't have permission to access this route`,
                HttpStatus.FORBIDDEN
            );
        }

        const isAlreadyExist = await this.usersService.getByEmail(payload.email.toLowerCase())

        if (isAlreadyExist) {
            throw new HttpException(
                `User with email: ${payload.email} already exist`,
                HttpStatus.CONFLICT
            );
        }

        const hash = await this.util.encryptPassword(payload.password);

        // Get roles
        const isRoleAlreadyInDB = await this.rolesService.getByRole(payload.role.toLowerCase());

        // create role if not exist in db

        payload.role = payload.role.toLowerCase();
        const roleId = isRoleAlreadyInDB ? isRoleAlreadyInDB.roleId : await this.rolesService.create(payload);

        const userPayload = {
            name: payload.name,
            email: payload.email,
            password: hash,
            orgId: null,
            roleId: roleId,
            bankId,
            isBankUser: true,
            head: false,
            status: STATUS.ACTIVE,
            permissions: payload.role === ROLE.SUPER_ADMIN ? true : payload.permissions,
        }

        const response = await this.banksService.createBankUser(userPayload);

        if (!response) {
            throw new HttpException(
                `Failed to create an user, please try again`,
                HttpStatus.BAD_REQUEST
            );
        }

        response.password = undefined;

        res.status(201).json({
            message: 'User created successfully',
            ...response
        });

    }


    @ApiOperation(
        {
            summary: 'Get users of a Bank',
            description: 'Get all the users of a bank as a logged in user including `Super Admin` `Master Admin` and `Admin` except `Plutos` and `Organization` user'
        }
    )
    @ApiResponse(
        {
            status: 201,
            type: TableFormatResponse,
        }
    )
    @UseGuards(AuthGuard)
    @RoleDecorator(ROLE.SUPER_ADMIN, ROLE.MASTER_ADMIN, ROLE.ADMIN)
    @Get('banks/users')
    async getUsers(
        @Req() req,
        @Res() res: Response,
        @Query(new JoiValidationPipe(JoiValidationSchema.paginationSchema)) paged: Paged
    ) {

        paged.offset = +paged.offset || 0;
        paged.limit = +paged.limit || 10;

        const { bankId, internal, orgId } = <AuthUser>req.user;

        if (internal || orgId) {
            throw new HttpException(
                `You don't have permission to access this route`,
                HttpStatus.FORBIDDEN
            );
        }

        const users = await this.banksService.getBankUsers(bankId, paged);

        if (!users || users.length < 1) {
            throw new HttpException(
                `No user(s) found`,
                HttpStatus.NOT_FOUND
            );
        }

        let total = users.length;

        // Get count from DB if total is more then limit set
        if (paged.offset > 0 || total >= paged.limit) {
            total = await this.banksService.getBankUsersCount();
        }

        res.status(200).json({
            total,
            returned: users.length,
            offset: paged.offset,
            limit: paged.limit,
            users
        });

    }

}