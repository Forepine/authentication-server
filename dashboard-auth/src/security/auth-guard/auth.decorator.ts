import { SetMetadata } from '@nestjs/common';
import { ROLE } from '../../enums/enum';

export const RoleDecorator = (...roles: ROLE[]) => SetMetadata('roles', roles);
