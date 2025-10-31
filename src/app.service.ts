import { Injectable, Logger } from '@nestjs/common';
import * as pjson from '../package.json';

@Injectable()
export class AppService {
	private logger = new Logger('HTTP');

	async debug(): Promise<string> {
		this.logger.log('Debug in AppService called.');
		return 'Thanks for using the debug endpoint!';
	}

	getVersion(): string {
        this.logger.log('Getting version ' + pjson.version)
		return pjson.version;
	}
}
