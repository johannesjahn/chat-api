import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDTO } from '../dtos/register.dto';
import { LoginDTO, LoginResponseDTO } from '../dtos/login.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth/')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiCreatedResponse({ type: LoginResponseDTO })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() _body: LoginDTO,
  ): Promise<LoginResponseDTO> {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() req: RegisterDTO) {
    return this.authService.register(req);
  }
}
