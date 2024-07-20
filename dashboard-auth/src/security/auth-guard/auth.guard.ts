import {
    HttpStatus,
    Injectable,
    CanActivate,
    HttpException,
    ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Utility } from '../../helpers/utils';
import { RolesService } from '../../roles/roles.service';


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private util: Utility,
        private reflector: Reflector,
        private rolesService: RolesService
    ) { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        const { authorization } = request.headers;

        if (!authorization || authorization.trim() === '') {
            throw new HttpException('Bearer token is required', HttpStatus.UNAUTHORIZED);
        }

        const cryptoToken = authorization.replace(/bearer/gim, '').trim();

        const accessToken = await this.util.cryptoDecrypt(cryptoToken);

        if (!accessToken) {
            throw new HttpException(
                `Token invalid or expired`,
                HttpStatus.UNAUTHORIZED,
            );
        }

        const decodedJWTToken = await this.util.verifyJWTToken(accessToken);

        if (!decodedJWTToken) {
            throw new HttpException(
                `Token invalid or expired`,
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (decodedJWTToken.isDeleted) {
            throw new HttpException(
                `Account deleted, create a new account`,
                HttpStatus.BAD_REQUEST,
            );
        }

        request.user = decodedJWTToken;

        const currentRoleValue = await this.rolesService.getByRoleId(decodedJWTToken.roleId);

        if (!currentRoleValue) {
            throw new HttpException(
                `Invalid token or expired`,
                HttpStatus.BAD_REQUEST,
            );
        }

        // checking for scope access now
        const { role: currentRole } = currentRoleValue;

        this.checkRoles(context, currentRole);

        return true;

    }

    private checkRoles(context: ExecutionContext, currentRole: string) {
        const routeRoles = this.reflector.get<string[]>('roles', context.getHandler());

        if (!routeRoles) {
            return true;
        }

        if (!routeRoles.some((role) => role === currentRole)) {
            throw new HttpException(
                `Your current role don't have permission to access this API`,
                HttpStatus.FORBIDDEN,
            );
        }
    }
}


