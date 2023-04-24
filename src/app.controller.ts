import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { VersionDTO } from './dtos/version.dto';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get('/debug')
  async getDebug() {
    const result = await this.appService.debug();
    console.log(result);
    return { message: result };
  }

  @ApiCreatedResponse({ type: VersionDTO })
  @Get('/version')
  getVersion() {
    const result = this.appService.getVersion();
    return { version: result };
  }
}
