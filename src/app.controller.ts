import { Controller, Get } from '@nestjs/common';
import { AppGateway } from './app.gateway';

@Controller()
export class AppController {
  constructor(private appGateway: AppGateway) {}

  @Get('/debug')
  async getDebug() {
    this.appGateway.sendToAll('Hello World');
    return { message: 'Thanks for using the debug endpoint.' };
  }
}
