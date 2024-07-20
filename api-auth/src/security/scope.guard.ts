import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Utility } from '../helpers/utils';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ScopeGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private utility: Utility,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const { authorization } = request.headers;

        if (!authorization || authorization.trim() === '') {
            throw new HttpException('Bearer token is required', HttpStatus.BAD_REQUEST);
        }

        const accessToken = authorization.replace(/bearer/gim, '').trim();

        const decodedJWTToken = await this.utility.verifyJWTToken(accessToken);

        if (!decodedJWTToken) {
            throw new HttpException(
                `Token invalid or expired`,
                HttpStatus.UNAUTHORIZED,
            );
        }

        // checking for scope access now
        const requestedScopes: string = decodedJWTToken.scopes;

        this.checkScopes(context, requestedScopes);

        return true;
    }

    private checkScopes(context: ExecutionContext, requestedScopes: string) {

        const routeScopes = this.reflector.get<string[]>('scopes', context.getHandler());

        if (!routeScopes) {
            return;
        }

        if (!routeScopes.some((scope) => requestedScopes.split(' ').some((x) => x === scope))
        ) {
            throw new HttpException(
                'You do not have permission to access this API',
                HttpStatus.FORBIDDEN,
            );
        }
    }
}
