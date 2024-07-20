import {
    Res,
    Body,
    Post,
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
import { Utility } from "../../helpers/utils";
import { Signin } from "../../types/signin.type";
import { ValidUser } from "../../types/user.type";
import { AdminAuthService } from "./admin-auth.service";
import { RolesService } from "../../roles/roles.service";
import { LoginResponse } from "../../types/response.type";
import { MAIL_SUBJECT, ROLE, STATUS } from "../../enums/enum";
import { JoiValidationPipe } from "../../pipes/validation.pipe";
import { JoiValidationSchema } from "../../validations/schema.validation";
import { EmailProducerQueue } from "../../queue/producers/email.producer";

// This module is belongs to PLUTOS ONE(INTERNAL) only

@ApiTags('Plutos Auth Controller')
@Controller('auth/admin')
export class AdminAuthController {

    constructor(
        private util: Utility,
        private rolesService: RolesService,
        private adminAuthService: AdminAuthService,
        private emailProducerQueue: EmailProducerQueue,
    ) { }

    @ApiOperation(
        {
            summary: 'Register on the platform as Plutos',
            description: 'Register as Plutos with default role `Owner` to have access of almost everything'
        })
    @ApiResponse(
        {
            status: 201,
            type: ValidUser
        }
    )
    @Post('register')
    async register(
        @Res() res: Response,
        @Body(new JoiValidationPipe(JoiValidationSchema.registerAdminUser)) payload: ValidUser
    ) {

        payload.email = payload.email.toLowerCase();

        const isAlreadyExist = await this.adminAuthService.getByEmail(payload.email);

        if (isAlreadyExist) {
            throw new HttpException(
                `Account with email: ${payload.email} already exist`,
                HttpStatus.CONFLICT
            );
        }

        const isRoleAlreadyInDB = await this.rolesService.getByRole(ROLE.OWNER);

        const roleId = isRoleAlreadyInDB ? isRoleAlreadyInDB.roleId : await this.rolesService.create({ role: ROLE.OWNER });

        payload.password = await this.util.encryptPassword(payload.password);

        payload._id = payload._id;
        payload.roleId = roleId;
        payload.permissions = true;
        payload.orgId = null;
        payload.status = STATUS.ACTIVE;
        payload.internal = true;
        payload.head = true;
        payload.isBankUser = false;
        payload.deletedAt = null;
        payload.isTwoFactorAuthenticationEnabled = false;
        payload.twoFactorAuthenticationSecret = null;

        const user = await this.adminAuthService.create(payload);

        if (!user) {
            throw new HttpException(
                `Failed to create user`,
                HttpStatus.BAD_REQUEST
            );
        }

        user.password = undefined;

        const emailPayload = {
            email: payload.email,
            name: payload.name,
            subject: MAIL_SUBJECT.WELCOME
        }

        this.emailProducerQueue.welcomeEmail(emailPayload);

        res.status(201).json(user)

    }


    @ApiOperation(
        {
            summary: 'Login on the platform as Plutos',
            description: 'Login as Plutos to get access token for further activites'
        })
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

        payload.email = payload.email.toLowerCase();

        const user = await this.adminAuthService.getUserFullDetailByEmail(payload.email);

        if (!user) {
            throw new HttpException(
                `User with email: ${payload.email} does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        // make sure only plutos and banks user can login
        if (user.orgId || user.bankId) {
            throw new HttpException(
                `This route belongs to Plutos users login only`,
                HttpStatus.BAD_REQUEST
            );
        }

        if (user.status !== STATUS.ACTIVE) {
            throw new HttpException(
                `Your account is Deactive`,
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
            userId: user['_id'],
            roleId: user.roleId,
            name: user.name,
            role: user['role'],
            permissions: user.permissions,
            status: user.status,
            internal: user.internal,
            isDeleted: user.isDeleted,
            twoFactorAuthenticationSecret: user.twoFactorAuthenticationSecret,
            isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled,
        }

        const token = await this.util.generateJWTToken(JWTpayload);

        const encrytpJwtToken = await this.util.cryptoEncrypt(token);

        res.status(200).json(
            {
                token: encrytpJwtToken,
                expiredIn: process.env.JWT_EXPIRY,
                issuedAt: new Date().toISOString(),
            }
        );

    }




}