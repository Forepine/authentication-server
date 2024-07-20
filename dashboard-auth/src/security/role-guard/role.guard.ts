import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Utility } from '../../helpers/utils';
import { RolesService } from '../../roles/roles.service';


@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private utility: Utility,
        private rolesService: RolesService,
    ) { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        const { authorization } = request.headers;

        if (!authorization || authorization.trim() === '') {
            throw new HttpException('Bearer token is required', HttpStatus.UNAUTHORIZED);
        }

        const cryptoToken = authorization.replace(/bearer/gim, '').trim();

        const accessToken = await this.utility.cryptoDecrypt(cryptoToken);

        if (!accessToken) {
            throw new HttpException(
                `Token invalid or expired`,
                HttpStatus.UNAUTHORIZED,
            );
        }

        const decodedJWTToken = await this.utility.verifyJWTToken(accessToken);

        if (!decodedJWTToken) {
            throw new HttpException(
                `Token invalid or expired`,
                HttpStatus.UNAUTHORIZED,
            );
        }

        const currentRoleValue = await this.rolesService.getByRoleId(decodedJWTToken.role_id)

        // checking for scope access now
        const { roleId: currentRole } = currentRoleValue;

        this.checkRoles(context, currentRole);

        return request.user = decodedJWTToken;

    }

    private checkRoles(context: ExecutionContext, currentRole: string | any) {
        const routeRoles = this.reflector.get<number[]>('roles', context.getHandler());

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
