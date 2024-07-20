import * as joi from 'joi';
import { Address } from '../types/address.type';
import { ORGANIZATION_TYPE, STATUS, Scopes } from '../enums/enum';

export class JoiValidationSchema {

    static registerAdminUser = joi.object({
        name: joi.string().min(2).max(20).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(100).required(),
    });

    static roleSchema = joi.object({
        role: joi.string().required(),
    });

    static moduleSchema = joi.object({
        module: joi.string().required(),
    });

    static loginSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).max(100).required(),
    });

    static orgRegisterSchema = joi.object({
        billerId: joi.string().optional().allow(null, ''),
        bankId: joi.string().required(),
        companyName: joi.string().min(2).max(50).required(),
        name: joi.string().min(2).max(50).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(100).required(),
        gst: joi.string().uppercase().alphanum().required().min(15).max(15),
        phone: joi.number().integer().min(10 ** 9).max(10 ** 10 - 1).required().messages({
            'number.min': 'Mobile number should be 10 digit.',
            'number.max': 'Mobile number should be 10 digit'
        }),
        address: joi.object().keys().valid(...Object.values(Address)).optional().allow(null, ''),
        scopes: joi.array().items(joi.string().valid(...Object.values(Scopes))).required(),
        type: joi.string().valid(...Object.values(ORGANIZATION_TYPE)), // remove from the production
    });

    static usersSchema = joi.object({
        name: joi.string().min(2).max(50).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(100).required(),
        role: joi.string().min(2).required(),
        permissions: joi.array().items(
            joi.object({
                module: joi.string().min(2).required(),
                create: joi.boolean().required(),
                read: joi.boolean().required(),
                update: joi.boolean().required(),
                delete: joi.boolean().required(),
            }),
        ),
    });

    static paginationSchema = joi.object({
        offset: joi.number().default(0).optional(),
        limit: joi.number().default(10).optional(),
        search: joi.string().optional().allow(null, ''),
        internal: joi.boolean().optional(),
    });

    static updateSelfSchema = joi.object({
        name: joi.string().min(2).max(50).required(),
    });

    static updateUserAsAdminSchema = joi.object({
        status: joi.string().valid(...Object.values(STATUS)).optional(),
        role: joi.string().optional(),
        permissions: joi.array().items(
            joi.object({
                module: joi.string().min(2).required(),
                create: joi.boolean().required(),
                read: joi.boolean().required(),
                update: joi.boolean().required(),
                delete: joi.boolean().required(),
            }),
        ),
    }).or('status', 'role').required();

    static updateOrganizationSchema = joi.object({
        companyName: joi.string().min(2).max(50).optional(),
        phone: joi.number().integer().min(10 ** 9).max(10 ** 10 - 1).optional().messages({
            'number.min': 'Mobile number should be 10 digit.',
            'number.max': 'Mobile number should be 10 digit'
        }),
        address: joi.object().keys().valid(...Object.values(Address)).optional().allow(null, ''),
        scopes: joi.array().items(joi.string().valid(...Object.values(Scopes))).optional(),
    }).or('companyName', 'scopes', 'address', 'phone').required();

    static updateOrganizationAsAdminSchema = joi.object({
        scopes: joi.array().items(joi.string().valid(...Object.values(Scopes))).optional(),
        status: joi.string().valid(...Object.values(STATUS)).optional(),
    }).or('scopes', 'status').required();

    static changePasswordSchema = joi.object({
        password: joi.string().min(6).max(100).required(),
        confirmPassword: joi.string().min(6).max(100).required(),
    });

    static registerBankSchema = joi.object({
        bankName: joi.string().min(2).max(100).required(),
        branch: joi.string().min(2).max(100).required(),
        address: joi.object().keys().valid(...Object.values(Address)).optional().allow(null, ''),
        name: joi.string().min(2).max(100).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(100).required(),
        phone: joi.number().integer().min(10 ** 9).max(10 ** 10 - 1).optional().messages({
            'number.min': 'Mobile number should be 10 digit.',
            'number.max': 'Mobile number should be 10 digit'
        }),
    });

    static updateBankSchema = joi.object({
        bankName: joi.string().min(2).max(100).required(),
        branch: joi.string().min(2).max(100).required(),
        address: joi.object().keys().valid(...Object.values(Address)).optional().allow(null, ''),
    });

    static addBankUserSchema = joi.object({
        name: joi.string().min(2).max(100).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(100).required(),
        role: joi.string().min(2).required(),
        permissions: joi.array().items(
            joi.object({
                module: joi.string().min(2).required(),
                create: joi.boolean().required(),
                read: joi.boolean().required(),
                update: joi.boolean().required(),
                delete: joi.boolean().required(),
            }),
        ).optional(),
    });

}