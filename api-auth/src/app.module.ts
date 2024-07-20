import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { Utility } from './helpers/utils';
import { AuthService } from './services/auth.service';
import { ScopeGuard } from './security/scope.guard';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRY },
    }),
    ThrottlerModule.forRoot([{
      ttl: +process.env.THROTTLE_TTL,
      limit: +process.env.THROTTLE_LIMIT,
    }]),
    HttpModule,
  ],
  controllers: [
    AuthController,
  ],
  providers: [
    AuthService,
    ScopeGuard,
    JwtService,
    Utility,
  ],
})
export class AppModule { }
