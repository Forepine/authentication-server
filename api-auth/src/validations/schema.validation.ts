import * as joi from 'joi';

export class ValidationSchema {

    static generateAccessTokenSchema = joi.object({
        clientKey: joi.string().required(),
        clientSecret: joi.string().required(),
        scopes: joi.string().required()
    });
}