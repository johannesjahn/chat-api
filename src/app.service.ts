import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async debug(): Promise<string> {
    return 'Thanks for using the debug endpoint.';
  }

  getVersion(): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pjson = require('../package.json');

    return pjson.version;
  }
}
