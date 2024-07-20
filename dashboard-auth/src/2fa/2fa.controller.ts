import {
    Get,
    Req,
    Res,
    Post,
    Body,
    UseGuards,
    Controller,
    HttpStatus,
    HttpException,
} from "@nestjs/common";
import {
    ApiTags,
    ApiResponse,
    ApiOperation,
    ApiBearerAuth,
} from "@nestjs/swagger";
import { Response } from 'express';
import { Utility } from "../helpers/utils";
import { AuthUser } from "../types/auth-user.type";
import { UsersService } from "../users/users.service";
import { AuthGuard } from "../security/auth-guard/auth.guard";
import { MessageResponse, TwoFAResponse } from "../types/response.type";


@ApiTags('2 Factor Authentication Controllers')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('auth')
export class twoFAController {

    constructor(
        private util: Utility,
        private usersService: UsersService,
    ) { }


    @ApiOperation(
        {
            summary: 'Setup your two factor authentication',
            description: 'Setup the 2FA and add another layer of security on your account'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: TwoFAResponse
        }
    )
    @Get('setup/2fa')
    async setup2FA(
        @Req() req,
        @Res() res: Response
    ) {

        const { email } = <AuthUser>req.user;

        const user = await this.usersService.getByEmail(email);

        const { secret, qr } = await this.util.setupTwoFactorAuthentication(user);

        if (!secret || !qr) {
            throw new HttpException(
                `Something went wrong, please try again`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json(
            {
                message: `Scan the QR code or type secret key in your authenticator app to enable two factor authentication. Also keep the secret key in case you remove account from your authenticator app, secret key will help you to login.`,
                QRCode: qr,
                secret

            }
        );
    }


    @ApiOperation(
        {
            summary: 'Validate Two-Factor Authentication',
            description: 'Validate your 2FA that you have just setup'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse
        }
    )
    @Get('validate/2fa')
    async validate2FA(
        @Req() req,
        @Res() res: Response
    ) {

        const { email } = <AuthUser>req.user;

        const user = await this.usersService.getByEmail(email);

        const response = await this.usersService.enableTwoFactorAuthentication(user['userId']);

        if (!response) {
            throw new HttpException(
                `Failed to enable Two-Factor Authentication`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json(
            {
                success: true,
                message: `Two-Factor Authentication enabled successfully`
            }
        );
    }


    @ApiOperation(
        {
            summary: 'Verify your two factor authentication code & get verified',
            description: 'Verify the 2FA code & get access of dashboard'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: String
        }
    )
    @Post('verify/2fa')
    async verify2FA(
        @Req() req,
        @Res() res: Response,
        @Body('code') code: string
    ) {

        if (!code) {
            throw new HttpException(
                `Invalid request, please provide TOTP code`,
                HttpStatus.BAD_REQUEST
            );
        }

        const { email } = <AuthUser>req.user;

        const user = await this.usersService.getByEmail(email);

        if (!user.isTwoFactorAuthenticationEnabled) {
            throw new HttpException(
                `You haven't setup 2FA, please setup 2FA then verify`,
                HttpStatus.BAD_REQUEST
            );
        }

        const is2FAValid = await this.util.verifyTwoFactorAuthenticationSecret(code, user);

        if (!is2FAValid) {
            throw new HttpException(
                `Invalid TOTP code`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            success: true,
            message: `Valid TOTP Code`
        });

    }
}

