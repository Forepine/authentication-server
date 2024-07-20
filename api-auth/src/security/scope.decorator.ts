import { SetMetadata } from '@nestjs/common';
import { Scopes } from '../enums/enum';

export const Scope = (...scopes: Scopes[]) => SetMetadata('scopes', scopes);
