import {
    HttpStatus,
    Injectable,
    HttpException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as qrcode from 'qrcode';
import * as bcrypt from 'bcrypt';
import { randomUUID } from "crypto";
import * as cryptoJS from 'crypto-js';
import { authenticator } from 'otplib';
import { User } from "../schemas/users.schema";
import { UsersService } from "../users/users.service";

@Injectable()
export class Utility {

    constructor(
        private jwtService: JwtService,
        private usersService: UsersService
    ) { }

    async encryptPassword(password: string) {
        if (!password) return null;
        try {
            const salt = await bcrypt.genSalt(10);
            return await bcrypt.hash(password, salt);
        } catch (e) {
            console.error(`Something went wrong, ${e}`);
            return;
        }
    }

    async decryptPassword(compareTo: string, compareWith: string) {
        if (!compareTo || !compareWith) return null;
        try {
            return await bcrypt.compare(compareTo, compareWith);
        } catch (e) {
            console.error(`Something went wrong, ${e}`);
            return;
        }
    }

    async generateRandomClientCredential() {
        const clientKey = randomUUID();
        const clientSecret = randomUUID();

        const hash = await this.encryptPassword(clientSecret);

        return {
            clientKey,
            clientSecret: hash
        }
    }

    async generateJWTToken(payload: any, expiresIn: string = process.env.JWT_EXPIRY) {
        try {
            return this.jwtService.sign(payload, { expiresIn });
        } catch (e) {
            console.error(`Something went wrong, ${e}`);
            return;
        }
    }

    async verifyJWTToken(token: string) {
        try {
            return await this.jwtService.verify(token);
        } catch (error) {
            throw new HttpException(
                'Access token expired or invalid',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async cryptoEncrypt(token: string) {
        try {
            return cryptoJS.AES.encrypt(token, process.env.CRYPTO_KEY).toString();
        } catch (e) {
            console.error(`Something went wrong while encrypting crypto token, ${e}`);
            return;
        }
    }

    async cryptoDecrypt(token: string) {
        try {
            return cryptoJS.AES.decrypt(token, process.env.CRYPTO_KEY).toString(cryptoJS.enc.Utf8)
        } catch (e) {
            console.error(`Something went wrong while decrypting crypto token, ${e}`);
            return;
        }
    }

    generateRandomCharacter(length: number = 4) {
        const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let str = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * alpha.length);
            str += alpha[randomIndex];
        }
        return str;
    }

    async setupTwoFactorAuthentication(user: User) {
        try {

            const secret = authenticator.generateSecret();

            const otpAuthUrl = authenticator.keyuri(user.email, 'PLUTOS-TSP-AUTH', secret);

            await this.usersService.setTwoFactorAuthenticationSecret(secret, user['userId']);

            const qr = await qrcode.toDataURL(otpAuthUrl);

            return {
                secret,
                qr
            }

        } catch (error) {
            console.error(`Something went wrong while generating 2FA Secret: ${error.message}`);
            return null;
        }
    }

    async verifyTwoFactorAuthenticationSecret(token: string, user: User) {
        try {
            return authenticator.check(token, user.twoFactorAuthenticationSecret);
        } catch (error) {
            console.error(`Something went wrong while verifying 2FA Secret: ${error.message}`);
            return null;
        }
    }

}