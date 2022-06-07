import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UserResponseDTO } from './dtos/user.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Get('/test')
  getAnyUser(@Request() req): Promise<UserResponseDTO> {
    return this.appService.getUser(req.user);
  }
}
