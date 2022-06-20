import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDTO } from '../dtos/register.dto';
import { LoginDTO, LoginResponseDTO } from '../dtos/login.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { UserMapper } from '../users/user.mapper';
import { UserResponseDTO } from 'src/dtos/user.dto';

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
    return this.authService.login(req.user.username, req.user.id);
  }

  @ApiCreatedResponse({ type: UserResponseDTO })
  @Post('register')
  async register(@Body() req: RegisterDTO) {
    const result = await this.authService.register(req);

    const mapper = new UserMapper();
    const dto = mapper.convert(result);

    return dto;
  }
}
