import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async debug(): Promise<string> {
    return 'Thanks for using the debug endpoint.';
  }
}
