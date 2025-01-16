import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			ignoreExpiration: false,
			secretOrKey: jwtConstants.getSecret(),
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			passReqToCallback: true,
		});
	}

	validate(request: Request, payload: any) {
		return { userId: payload.sub, username: payload.username };
	}
}
