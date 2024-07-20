import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as cryptoJS from 'crypto-js'

@Injectable()
export class Utility {
    constructor(
        private jwtService: JwtService,
    ) { }

    async generateJWTToken(payload: any): Promise<any> {
        if (!payload) return;
        try {
            return this.jwtService.sign(payload, { secret: process.env.JWT_SECRET });
        } catch (e) {
            return false;
        }
    }

    async verifyJWTToken(token: string): Promise<any> {
        if (!token) return;
        try {
            const encryptedAccessToken = await this.cryptoDecrypt(token);
            return await this.jwtService.verify(encryptedAccessToken, { secret: process.env.JWT_SECRET });
        } catch (e) {
            return false;
        }
    }

    async cryptoEncrypt(token: string): Promise<string> {
        try {
            return cryptoJS.AES.encrypt(token, process.env.CRYPTO_KEY).toString();
        } catch (error) {
            throw new HttpException(
                `Something went wrong while encrypting token`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async cryptoDecrypt(token: string): Promise<string> {
        try {
            return cryptoJS.AES.decrypt(token, process.env.CRYPTO_KEY).toString(cryptoJS.enc.Utf8)
        } catch (error) {
            throw new HttpException(
                `Something went wrong while decrypting token`,
                HttpStatus.BAD_REQUEST
            );
        }
    }
}