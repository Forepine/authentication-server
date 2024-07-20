import {
    Res,
    Body,
    Post,
    Query,
    HttpStatus,
    Controller,
    HttpException,
} from "@nestjs/common";
import {
    ApiBody,
    ApiTags,
    ApiResponse,
    ApiOperation,
} from "@nestjs/swagger";
import { Response } from "express";
import { Utility } from "../helpers/utils";
import { Signin } from "../types/signin.type";
import { UsersService } from "../users/users.service";
import { BanksService } from "../banks/banks.service";
import { RolesService } from "../roles/roles.service";
import { OrgSignup } from "../types/organizations.type";
import { JoiValidationPipe } from "../pipes/validation.pipe";
import { ChangePassword } from "../types/change-password.type";
import { Organization } from "../schemas/organizations.schema";
import { ORGANIZATION_TYPE, ROLE, STATUS } from "../enums/enum";
import { ClientCredential } from "../types/client-credential.type";
import { JoiValidationSchema } from "../validations/schema.validation";
import { OrganizationService } from "../organizations/organizations.service";
import { LoginResponse, MessageResponse, OrganizationRegisterResponse } from "../types/response.type";


// This module is belongs to Organization only


@ApiTags('Biller or Agent Institution Auth Controller')
@Controller('auth')
export class AuthController {

    constructor(
        private util: Utility,
        private rolesService: RolesService,
        private banksService: BanksService,
        private usersService: UsersService,
        private orgService: OrganizationService,
    ) { }

    @ApiOperation(
        {
            summary: 'Register an account as Biller or AI',
            description: 'Create your account as Biller or AI with default role as `Super Admin` & `Head` of the account'
        }
    )
    @ApiResponse(
        {
            status: 201,
            type: OrganizationRegisterResponse
        }
    )
    @Post('register')
    async register(
        @Res() res: Response,
        @Body(new JoiValidationPipe(JoiValidationSchema.orgRegisterSchema)) payload: OrgSignup
    ) {

        const isEmailExist = await this.usersService.getByEmail(payload.email.toLowerCase());

        if (isEmailExist) {
            throw new HttpException(
                `Account with email: ${payload.email} already exist`,
                HttpStatus.CONFLICT
            );
        }

        const isGSTExist = await this.orgService.getOrganizationByGST(payload.gst);

        if (isGSTExist) {
            throw new HttpException(
                `Account with GST: ${payload.gst} already exist`,
                HttpStatus.CONFLICT
            );
        }

        const isBankExist = await this.banksService.getBankById(payload.bankId);

        if (!isBankExist) {
            throw new HttpException(
                `Bank with bankId: ${payload.bankId} does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        const { clientKey, clientSecret } = await this.util.generateRandomClientCredential();

        const randomGeneratedOrgId = this.util.generateRandomCharacter();

        // decorating organzation data
        const org = {
            orgId: `${payload.companyName.slice(0, 3).toUpperCase()}${randomGeneratedOrgId}`,
            bankId: isBankExist.bankId,
            companyName: payload.companyName,
            phone: payload.phone,
            gst: payload.gst,
            address: payload.address,
            type: payload.type || ORGANIZATION_TYPE.AI,
            status: STATUS.ACTIVE,
            clientKey,
            clientSecret,
            scopes: payload.scopes.join(' '),
            isDeleted: false,
            deletedAt: null
        }

        const Organization = await this.orgService.create(org);

        if (!Organization) {
            throw new HttpException(
                `Something went wrong while creating account`,
                HttpStatus.BAD_REQUEST
            );
        }

        // Get roles
        const isRoleAlreadyInDB = await this.rolesService.getByRole(ROLE.SUPER_ADMIN);

        const roleId = isRoleAlreadyInDB ? isRoleAlreadyInDB.roleId : await this.rolesService.create({ role: ROLE.SUPER_ADMIN });

        const hash = await this.util.encryptPassword(payload.password);

        // decorating user data
        const userPayload = {
            _id: null,
            orgId: Organization.orgId,
            bankId: payload.bankId,
            name: payload.name,
            email: payload.email,
            password: hash,
            roleId,
            head: true,
            status: STATUS.ACTIVE,
            permissions: true,
            internal: false,
            isBankUser: false,
            isDeleted: false,
            deletedAt: null,
            isTwoFactorAuthenticationEnabled: false,
            twoFactorAuthenticationSecret: null
        }

        const user = await this.usersService.create(userPayload);

        if (!user) {
            throw new HttpException(
                `Something went wrong while creating user`,
                HttpStatus.BAD_REQUEST
            );
        }

        const { password, ...rest } = user;

        res.status(201).json(
            {
                ...org,
                ...rest
            }
        );

    }


    @ApiOperation(
        {
            summary: 'Login in your account as Biller or AI',
            description: 'Login in your account as Biller or AI & get access token for further activites'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: LoginResponse
        }
    )
    @Post('login')
    async login(
        @Res() res: Response,
        @Body(new JoiValidationPipe(JoiValidationSchema.loginSchema)) payload: Signin
    ) {

        const user = await this.usersService.getUserDetailByEmail(payload.email.toLowerCase());

        if (!user || user.status !== STATUS.ACTIVE) {
            throw new HttpException(
                `User with email: ${payload.email} does not exist or deactive`,
                HttpStatus.NOT_FOUND
            );
        }

        // make sure only org's user can login 
        if (!user.orgId) {
            throw new HttpException(
                `This route belongs to Organization's login only`,
                HttpStatus.BAD_REQUEST
            );
        }

        if (user['orgStatus'] !== STATUS.ACTIVE) {
            throw new HttpException(
                `Organization with id: ${user.orgId} is deactive, please contact Plutos ONE`,
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
            name: user.name,
            role: user['role'],
            orgId: user.orgId,
            userId: user['_id'],
            status: user.status,
            head: user.head,
            internal: user.internal,
            isDeleted: user.isDeleted,
            permissions: user.permissions,
            twoFactorAuthenticationSecret: user.twoFactorAuthenticationSecret,
            isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled,
        }

        const token = await this.util.generateJWTToken(JWTpayload);

        const encrytpJwtToken = await this.util.cryptoEncrypt(token);

        res.status(200).json(
            {
                token: encrytpJwtToken,
                expiredIn: process.env.JWT_EXPIRY,
                createdAt: new Date().toISOString(),
            }
        );

    }


    @ApiTags('Common Controllers')
    @ApiOperation(
        {
            summary: 'Request with your email to get access token',
            description: 'Request with your registered email address and get access token to set up your new password',
        }
    )
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    description: 'Your registered email address'
                }
            },
            required: ['email'],
            example: { email: 'email@email.com' }
        },
    })
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse
        }
    )
    @Post('forgot-password')
    async forgotPassword(
        @Res() res: Response,
        @Body('email') email: string
    ) {

        const user = await this.usersService.getByEmail(email);

        if (!user || user.status !== STATUS.ACTIVE) {
            throw new HttpException(
                `User with email: ${email} does not exist or deactive`,
                HttpStatus.NOT_FOUND
            );
        }

        const payload = {
            email: user.email,
            orgId: user.orgId,
            userId: user['userId'],
            role: user['role']
        }

        const JWTtoken = await this.util.generateJWTToken(payload, '15m');

        const encryptedToken = await this.util.cryptoEncrypt(JWTtoken);

        res.status(200).json({
            message: `Set your password using the link, link will expires in 15 minutes`,
            token: encryptedToken
        });

    }


    @ApiTags('Common Controllers')
    @ApiOperation(
        {
            summary: 'Reset your password with valid access token',
            description: 'Reset your password with valid access token in query & set you new password'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: 'object'
        }
    )
    @Post('reset-password')
    async resetPassword(
        @Res() res: Response,
        @Query('token') token: string,
        @Body(new JoiValidationPipe(JoiValidationSchema.changePasswordSchema)) payload: ChangePassword
    ) {

        if (!token) {
            throw new HttpException(
                `Please provide token`,
                HttpStatus.BAD_REQUEST
            );
        }

        // temporary solution -- replace  space with + 
        const decryptedToken = await this.util.cryptoDecrypt(token.replaceAll(' ', '+'));

        if (!decryptedToken) {
            throw new HttpException(
                `Invalid or expired token`,
                HttpStatus.BAD_REQUEST
            );
        }

        const { userId } = await this.util.verifyJWTToken(decryptedToken);

        if (!userId) {
            throw new HttpException(
                `Invalid or expired token`,
                HttpStatus.BAD_REQUEST
            );
        }

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


    @ApiOperation(
        {
            summary: 'Validate Client Credentials',
            description: 'Authenticate using client key and secret for access authorization'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: Organization
        }
    )
    @Post('validate')
    async isCredentialValid(
        @Res() res: Response,
        @Body() payload: ClientCredential
    ) {

        const { clientKey, clientSecret } = payload;

        const org = await this.orgService.getOrganizationByClientCredential(clientKey, clientSecret);

        if (!org) {
            throw new HttpException(
                `Invalid client key or secret, or organization does not exist`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json(org);

    }


    @ApiTags('Common Controllers')
    @ApiOperation(
        {
            summary: 'Validate Dashboard Access Token',
            description: 'Authenticate dashboard access token'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: 'object',
        }
    )
    @Post('verify-token')
    async verifyAccessToken(
        @Res() res: Response,
        @Body('token') token: string
    ) {

        if (!token) {
            throw new HttpException(
                `Token must not be empty`,
                HttpStatus.BAD_REQUEST
            );
        }

        const decodedToken = await this.util.cryptoDecrypt(token);

        const verifedToken = await this.util.verifyJWTToken(decodedToken);
        if (!verifedToken) {
            throw new HttpException(
                `Invalid token or token expired`,
                HttpStatus.UNAUTHORIZED
            );
        }

        res.status(200).json({
            success: true,
            token: 'Valid access token'
        });
    }
}