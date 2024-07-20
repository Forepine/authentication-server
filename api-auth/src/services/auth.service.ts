import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { Scopes } from "../enums/enum";
import { Utility } from "../helpers/utils";

@Injectable()
export class AuthService {
    constructor(
        private utility: Utility,
        private httpClient: HttpService,
    ) { }

    async generateAccessToken(payload: any): Promise<string> {
        const accessToken = await this.utility.generateJWTToken(payload);
        const encryptAccessToken = await this.utility.cryptoEncrypt(accessToken);
        return encryptAccessToken;
    }

    async validateScopes(scope: string): Promise<boolean> {
        if (!scope) return false;

        const scopes: string[] = scope.split(' ');
        return scopes.every(scope => Object.values(Scopes).some((v) => v === scope));
    }

    async validateCredentails(clientKey: string, clientSecret: string) {
        return await this.httpClient.axiosRef.post(process.env.VALIDATE_URL, { clientKey, clientSecret })
            .then(response => response.data)
            .then(data => data)
            .catch(e => e.data);
    }

}