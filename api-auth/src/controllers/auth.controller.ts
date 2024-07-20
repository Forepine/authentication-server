import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Post,
    Res,
    UseGuards,
} from "@nestjs/common";
import {
    ApiExcludeEndpoint,
    ApiOperation,
    ApiResponse,
    ApiTags
} from "@nestjs/swagger";
import { Response } from "express";
import { ThrottlerGuard } from '@nestjs/throttler';
import { ScopeGuard } from "../security/scope.guard";
import { AuthService } from "../services/auth.service";
import { JoiValidationPipe } from "../pipes/validation.pipe";
import { ClientCredentials } from "../types/credential.type";
import { ValidationSchema } from "../validations/schema.validation";


@ApiTags('API Controller')
@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
    ) { }

    @ApiOperation({
        summary: 'Get access token',
        description: 'Request with valid client key & client secret and generate the access token for further APIs access'
    })
    @ApiResponse({ type: 'string' })
    @UseGuards(ThrottlerGuard)
    @Post('token')
    async generateAccessToken(
        @Res() res: Response,
        @Body(new JoiValidationPipe(ValidationSchema.generateAccessTokenSchema)) payload: ClientCredentials
    ) {

        const { clientKey, clientSecret, scopes } = payload;

        const credentials = await this.authService.validateCredentails(clientKey, clientSecret);

        if (!credentials) {
            throw new HttpException(
                `client key or client secret is invalid`,
                HttpStatus.BAD_REQUEST
            );
        }

        // this will check whether the provided scopes are matching with enums or not
        const isValidScope = await this.authService.validateScopes(scopes);

        if (!isValidScope) {
            throw new HttpException(
                `Invalid scope.`,
                HttpStatus.BAD_REQUEST
            );
        }

        const scopesArray = payload.scopes.split(' ');
        const hasAllScopes = scopesArray.every(scope => credentials.scopes.split(' ').includes(scope));

        if (!hasAllScopes) {
            throw new HttpException(
                `You don't have permission to access this scope(s)`,
                HttpStatus.BAD_REQUEST
            );
        }

        const accessToken = await this.authService.generateAccessToken(payload);
        if (!accessToken) {
            throw new HttpException(
                `Something went wrong while generating access token, please try again`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            access_token: accessToken,
            token_type: 'Bearer',
            scope: scopes,
            created_at: new Date().toISOString(),
        });
    }

    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Verify access token' })
    @ApiResponse({ type: 'string' })
    @UseGuards(ScopeGuard)
    @Post('verify-token')
    async verifyToken(
        @Res() res: Response
    ) {

        res.status(200).json({
            success: true,
            token: 'Valid access token'
        });
    }
}