import {
    Get,
    Put,
    Req,
    Res,
    Body,
    Delete,
    UseGuards,
    HttpStatus,
    Controller,
    HttpException,
    Param,
    Patch,
} from "@nestjs/common";
import {
    ApiTags,
    ApiResponse,
    ApiOperation,
    ApiBearerAuth,
} from "@nestjs/swagger";
import { Response } from "express";
import { ROLE, STATUS } from "../enums/enum";
import { AuthUser } from "../types/auth-user.type";
import { UsersService } from "../users/users.service";
import { MessageResponse } from "../types/response.type";
import { JoiValidationPipe } from "../pipes/validation.pipe";
import { AuthGuard } from "../security/auth-guard/auth.guard";
import { OrganizationService } from "./organizations.service";
import { Organization } from "../schemas/organizations.schema";
import { organizationUpdate } from "../types/organizations.type";
import { RoleDecorator } from "../security/auth-guard/auth.decorator";
import { JoiValidationSchema } from "../validations/schema.validation";
import { Utility } from "../helpers/utils";

@ApiTags('Organizations Controllers')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('organizations')
export class OrganizationController {

    constructor(
        private util: Utility,
        private orgService: OrganizationService,
        private usersService: UsersService,
    ) { }


    @ApiOperation(
        {
            summary: 'Get organization ',
            description: 'Logged in user can get organization detail if logged in user is an `organization` user'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: Organization
        }
    )
    @Get()
    async get(
        @Req() req,
        @Res() res: Response
    ) {

        const { orgId } = <AuthUser>req.user;

        if (!orgId) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        const organization = await this.orgService.getOrganization(orgId);

        if (!organization || organization.status !== STATUS.ACTIVE) {
            throw new HttpException(
                `Organization with id: ${orgId} does not exist or deactive`,
                HttpStatus.NOT_FOUND
            );
        }

        organization['_id'] = undefined;

        res.status(200).json(organization);
    }

    

    @ApiOperation(
        {
            summary: 'Update an organization detail',
            description: 'Logged in user with role `Super Admin` can update an organization detail if logged in user is an `organization` user'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse
        }
    )
    @RoleDecorator(ROLE.SUPER_ADMIN)
    @Put()
    async update(
        @Req() req,
        @Res() res: Response,
        @Body(new JoiValidationPipe(JoiValidationSchema.updateOrganizationSchema)) payload: organizationUpdate
    ) {

        const { orgId } = <AuthUser>req.user;

        if (!orgId) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        const response = await this.orgService.updateOrganization(orgId, payload);

        if (!response) {
            throw new HttpException(
                `Failed to update an organization`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `Organization with id: '${orgId}' updated successfully`
        });

    }



    @ApiOperation(
        {
            summary: 'Update Client Secret of organization',
            description: 'Update Client Secret of an organization as `Super Admin` and `Admin` of the account',

        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse
        }
    )
    @RoleDecorator(ROLE.SUPER_ADMIN, ROLE.ADMIN)
    @Patch()
    async updateClientSecret(
        @Req() req,
        @Res() res: Response,
    ) {

        const { internal, isBankUser, orgId } = <AuthUser>req.user;

        if (!internal && !isBankUser) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        const { clientSecret } = await this.util.generateRandomClientCredential();

        const response = await this.orgService.updateClientSecret(orgId, clientSecret);

        if (!response) {
            throw new HttpException(
                `Failed to update client secret, try again`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: 'Client-Secret updated successfully'
        });

    }



    @ApiOperation(
        {
            summary: 'Delete organization',
            description: 'Logged in user with role `Super Admin` can delete(soft) an organization if logged in user is an `organization` user'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse
        }
    )
    @RoleDecorator(ROLE.SUPER_ADMIN)
    @Delete()
    async delete(
        @Req() req,
        @Res() res: Response,
    ) {

        const { orgId, head, isBankUser } = <AuthUser>req.user;

        if (!head) {
            throw new HttpException(
                `You don't have permission to delete an organization, only the root Super Admin can delete an Organization`,
                HttpStatus.FORBIDDEN
            );
        }

        if (!orgId || isBankUser) {
            throw new HttpException(
                `You don't have permission to access this API`,
                HttpStatus.FORBIDDEN
            );
        }

        const response = await this.orgService.deleteOrganization(orgId);

        if (!response) {
            throw new HttpException(
                `Failed to delete an organization`,
                HttpStatus.BAD_REQUEST
            );
        }

        const deleteAssociateUsers = await this.usersService.deleteOrgUsers(orgId);

        if (!deleteAssociateUsers) {
            throw new HttpException(
                `Failed to delete organization's associated users`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `Organization with id: '${orgId}' deleted successfully`
        });

    }

}