import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { UserAuth } from '../users/userAuth.entity';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

export const jwtModule = JwtModule.registerAsync({
	useFactory: () => {
		return { secret: jwtConstants.getSecret(), signOptions: {} };
	},
});

@Module({
	imports: [
		UsersModule,
		PassportModule,
		jwtModule,
		TypeOrmModule.forFeature([User]),
		TypeOrmModule.forFeature([UserAuth]),
	],
	providers: [AuthService, LocalStrategy, JwtStrategy],
	exports: [AuthService],
	controllers: [AuthController],
})
export class AuthModule {}
