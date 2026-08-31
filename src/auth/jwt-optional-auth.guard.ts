import { Injectable, Optional } from '@nestjs/common';
import { AuthGuard, AuthModuleOptions } from '@nestjs/passport';

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
	constructor(@Optional() options?: AuthModuleOptions) {
		super(options);
	}

	handleRequest(err: any, user: any) {
		return user;
	}
}
