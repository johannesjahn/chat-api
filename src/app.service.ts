import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
	private logger = new Logger('HTTP');

	async debug(): Promise<string> {
		this.logger.log('Debug in AppService called.');
		return 'Thanks for using the debug endpoint!!';
	}

	getVersion(): string {
		// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
		const pjson = require('../package.json');

		this.logger.log('Getting version ' + pjson.version);
		return pjson.version;
	}
}
