import {
  ThrottlerGuard,
  ThrottlerModule
} from '@nestjs/throttler';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { Utility } from './helpers/utils';
import { AWSModule } from './aws/aws.module';
import { TwoFAModule } from './2fa/2fa.module';
import { AuthModule } from './auth/auth.module';
import MONGOCONFIG from './config/mongo.config';
import { BanksModule } from './banks/banks.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AdminModule } from './admin/admin.module';
import { QUEUECONFIG } from './config/queue.config';
import { PlutosModule } from './plutos/plutos.module';
import { ScopesModule } from './scopes/scopes.module';
import { LoggersModule } from './logger/logger.module';
import { ModulesModule } from './modules/modules.module';
import { RoleGuard } from './security/role-guard/role.guard';
import { AdminAuthModule } from './admin/auth/admin-auth.module';
import { EmailService } from './notifications/email.notification';
import { EmailProducerQueue } from './queue/producers/email.producer';
import { EmailConsumerQueue } from './queue/consumers/email.consumer';
import { InterceptorModule } from './interceptors/interceptor.module';
import { OrganizationModule } from './organizations/organizations.module';

@Module(
  {
    imports: [
      ConfigModule.forRoot(
        {
          isGlobal: true,
        }
      ),
      JwtModule.register(
        {
          global: true,
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: process.env.JWT_EXPIRY },
        }
      ),
      ...MONGOCONFIG,
      ...QUEUECONFIG,
      ThrottlerModule.forRoot(
        [
          {
            ttl: +process.env.THROTTLE_TTL,
            limit: +process.env.THROTTLE_LIMIT,
          }
        ]
      ),
      AWSModule,
      AuthModule,
      AdminModule,
      RolesModule,
      UsersModule,
      BanksModule,
      TwoFAModule,
      ScopesModule,
      PlutosModule,
      ModulesModule,
      LoggersModule,
      AdminAuthModule,
      InterceptorModule,
      OrganizationModule,
    ],
    providers: [
      {
        provide: APP_GUARD,
        useClass: ThrottlerGuard
      },
      Utility,
      RoleGuard,
      EmailService,
      EmailConsumerQueue,
      EmailProducerQueue,
    ],
  }
)
export class AppModule { }
