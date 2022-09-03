import { Controller, Get, Request } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private appGateway: AppGateway,
  ) {}

  @ApiBearerAuth()
  @Get('/debug')
  async getDebug() {
    this.appGateway.sendToAll('Hello World');
    return { message: 'Thanks for using the debug endpoint.' };
  }
}
