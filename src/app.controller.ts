import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get('/debug')
  async getDebug() {
    const result = await this.appService.debug();
    console.log(result);
    return { message: result };
  }

  @Get('/version')
  getVersion() {
    const result = this.appService.getVersion();
    return { version: result };
  }
}
