import { SetMetadata } from '@nestjs/common';
import { ROLE } from '../../enums/enum';


export const Role = (...roles: ROLE[]) => SetMetadata('roles', roles);
