import {
    Res,
    Req,
    Post,
    Body,
    UseGuards,
    Controller,
    HttpStatus,
    HttpException,
} from "@nestjs/common";
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
} from "@nestjs/swagger";
import { Response } from 'express';
import { Utility } from "../helpers/utils";
import { ROLE, STATUS } from "../enums/enum";
import { ValidUser } from "../types/user.type";
import { PlutosService } from "./plutos.service";
import { AuthUser } from "../types/auth-user.type";
import { RolesService } from "../roles/roles.service";
import { JoiValidationPipe } from "../pipes/validation.pipe";
import { AuthGuard } from "../security/auth-guard/auth.guard";
import { AdminAuthService } from "../admin/auth/admin-auth.service";
import { RoleDecorator } from "../security/auth-guard/auth.decorator";
import { JoiValidationSchema } from "../validations/schema.validation";

@ApiTags('Plutos Controllers - Internal')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('plutos/users')
export class PlutosController {

    constructor(
        private util: Utility,
        private rolesService: RolesService,
        private plutosService: PlutosService,
        private adminAuthService: AdminAuthService,
    ) { }


    @ApiOperation(
        {
            summary: 'Add user in Plutos',
            description: 'Add user(s) in plutos if you are an user of `Internal` and role of `Owner` `Super Admin` & `Admin`'
        }
    )
    @ApiResponse(
        {
            status: 201,
            type: ValidUser
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN, ROLE.ADMIN)
    @Post()
    async addUser(
        @Req() req,
        @Res() res: Response,
        @Body(new JoiValidationPipe(JoiValidationSchema.usersSchema)) payload: ValidUser
    ) {

        const { internal } = <AuthUser>req.user;

        if (!internal) {
            throw new HttpException(
                `You don't have permission to add user in Plutos ONE`,
                HttpStatus.BAD_REQUEST
            );
        }

        const user = await this.adminAuthService.getByEmail(payload.email);

        if (user) {
            throw new HttpException(
                `Account with email: ${payload.email} already exist`,
                HttpStatus.CONFLICT
            );
        }


        payload.role = payload.role.toLowerCase();


        if (payload.role === ROLE.OWNER) {
            throw new HttpException(
                `Only one account can have one 'owner'`,
                HttpStatus.BAD_REQUEST
            );
        }

        payload.password = await this.util.encryptPassword(payload.password);

        const role = await this.rolesService.getByRole(payload.role);

        if (!role) {
            throw new HttpException(
                `Role with name: ${payload.role} does not exist, please create role first`,
                HttpStatus.NOT_FOUND
            );
        }

        payload.head = false;
        payload.internal = true;
        payload.isBankUser = false;
        payload.roleId = role.roleId;
        payload.status = STATUS.ACTIVE;
        payload.twoFactorAuthenticationSecret = null;
        payload.isTwoFactorAuthenticationEnabled = false;
        payload.head = payload.role == ROLE.SUPER_ADMIN ? true : false;
        payload.permissions = payload.role == ROLE.SUPER_ADMIN ? true : payload.permissions;

        const response = await this.plutosService.createUser(payload);

        if (!response) {
            throw new HttpException(
                `Failed to create new plutos user`,
                HttpStatus.CONFLICT
            );
        }

        response.password = undefined;

        res.status(201).json(response);

    }

}