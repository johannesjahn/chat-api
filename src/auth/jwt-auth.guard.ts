import { Injectable, Optional } from '@nestjs/common';
import { AuthGuard, AuthModuleOptions } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	// Nest 12 reads @Optional() metadata with getOwnMetadata, so it is no longer
	// inherited from the AuthGuard() mixin. Redeclare the constructor to keep
	// AuthModuleOptions optional in modules that don't register PassportModule.
	constructor(@Optional() options?: AuthModuleOptions) {
		super(options);
	}
}
