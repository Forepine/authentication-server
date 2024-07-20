import {
    Req,
    Get,
    Put,
    Res,
    Post,
    Body,
    Query,
    Param,
    Delete,
    UseGuards,
    HttpStatus,
    Controller,
    HttpException,
} from "@nestjs/common";
import {
    ApiTags,
    ApiResponse,
    ApiOperation,
    ApiBearerAuth,
} from "@nestjs/swagger";
import { Response } from "express";
import { ROLE } from "../enums/enum";
import { Module } from "../types/modules.type";
import { ModulesService } from "./modules.service";
import { AuthUser } from "../types/auth-user.type";
import { MessageResponse } from "../types/response.type";
import { JoiValidationPipe } from "../pipes/validation.pipe";
import { AuthGuard } from "../security/auth-guard/auth.guard";
import { RoleDecorator } from "../security/auth-guard/auth.decorator";
import { JoiValidationSchema } from "../validations/schema.validation";

@ApiTags('Modules Controllers - Internal')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('modules')
export class ModulesController {

    constructor(
        private modulesService: ModulesService
    ) { }


    @ApiOperation(
        {
            summary: 'Add module',
            description: 'Add new module(s) if your are a user of `Internal` and role `Owner` & `Super Admin`'
        }
    )
    @ApiResponse(
        {
            status: 201,
            type: MessageResponse
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN)
    @Post()
    async create(
        @Req() req,
        @Res() res: Response,
        @Body(new JoiValidationPipe(JoiValidationSchema.moduleSchema)) payload: Module
    ) {

        const { internal } = <AuthUser>req.user;

        if (!internal) {
            throw new HttpException(
                `Only Plutos can add module(s)`,
                HttpStatus.FORBIDDEN
            );
        }

        payload.module = payload.module.toLowerCase().trim();

        const isAlreadyExist = await this.modulesService.getModuleByName(payload.module);

        if (isAlreadyExist) {
            throw new HttpException(
                `Module with name: ${payload.module} already exist`,
                HttpStatus.CONFLICT
            );
        }

        const response = await this.modulesService.create(payload);

        if (!response) {
            throw new HttpException(
                `Failed to create module`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(201).json({
            message: `Module with name: '${payload.module}' created successfully`
        });

    }


    @ApiOperation(
        {
            summary: 'Get modules',
            description: 'Get all the existing modules'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: [Module]
        }
    )
    @Get()
    async getModules(
        @Res() res: Response
    ) {

        const modules = await this.modulesService.getModules();

        if (!modules || modules.length < 1) {
            throw new HttpException(
                `Module(s) not found`,
                HttpStatus.NOT_FOUND
            );
        }

        res.status(200).json(modules);
    }


    @ApiOperation(
        {
            summary: 'Get module by name',
            description: 'Get module detail by module name'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: Module
        }
    )
    @Get('name')
    async getModuleByName(
        @Res() res: Response,
        @Query('name') name: string
    ) {

        const module = await this.modulesService.getModuleByName(name.toLowerCase().trim());

        if (!module) {
            throw new HttpException(
                `Module with name: ${name} does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        res.status(200).json(module);
    }


    @ApiOperation(
        {
            summary: 'Get module by ID',
            description: 'Get module detail by module module ID'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: Module
        }
    )
    @Get(':id')
    async getModuleById(
        @Res() res: Response,
        @Param('id') moduleId: string
    ) {

        const module = await this.modulesService.getModuleById(moduleId);

        if (!module) {
            throw new HttpException(
                `Module with id: ${moduleId} does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        res.status(200).json(module);
    }


    @ApiOperation(
        {
            summary: 'Update module by ID',
            description: 'Update module if your are a user of `Internal` and role `Owner` & `Super Admin`'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN)
    @Put(':id')
    async updateModule(
        @Req() req,
        @Res() res: Response,
        @Param('id') moduleId: string,
        @Body(new JoiValidationPipe(JoiValidationSchema.moduleSchema)) payload: Module
    ) {

        const { internal } = <AuthUser>req.user;

        if (!internal) {
            throw new HttpException(
                `Only Plutos can update module`,
                HttpStatus.FORBIDDEN
            );
        }

        const module = await this.modulesService.getModuleById(moduleId);

        if (!module) {
            throw new HttpException(
                `Module with id: ${moduleId} does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        payload.module = payload.module.toLowerCase();

        const isAlreadyExist = await this.modulesService.getModuleByName(payload.module);

        if (isAlreadyExist) {
            throw new HttpException(
                `A module with name: ${payload.module} already exist`,
                HttpStatus.CONFLICT
            );
        }

        const response = await this.modulesService.updateModule(moduleId, payload.module);

        if (!response) {
            throw new HttpException(
                `Module does not exist or unable to update`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `Module with id: ${moduleId} updated successfully`
        });
    }


    @ApiOperation(
        {
            summary: 'Delete module by ID(s)',
            description: 'Delete module(s) if your are a user of `Internal` and role `Owner` & `Super Admin`'
        }
    )
    @ApiResponse(
        {
            status: 200,
            type: MessageResponse
        }
    )
    @RoleDecorator(ROLE.OWNER, ROLE.SUPER_ADMIN)
    @Delete()
    async deleteModules(
        @Req() req,
        @Res() res: Response,
        @Query('id') moduleIds: any
    ) {

        const { internal } = <AuthUser>req.user;

        if (!internal) {
            throw new HttpException(
                `Only Plutos can update module`,
                HttpStatus.FORBIDDEN
            );
        }


        if (typeof moduleIds === 'string') {
            moduleIds = moduleIds.split(' ');
        }

        const response = await this.modulesService.deleteModules(moduleIds);

        if (!response) {
            throw new HttpException(
                `Module(s) does not exist or unable to delete`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(200).json({
            message: `Module with id(s): ${moduleIds} deleted successfully`
        });

    }

}