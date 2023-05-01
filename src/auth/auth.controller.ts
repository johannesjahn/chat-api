import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  HttpException,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDTO } from '../dtos/register.dto';
import { LoginDTO, LoginResponseDTO } from '../dtos/login.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserMapper } from '../users/user.mapper';
import { UserResponseDTO } from 'src/dtos/user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangePasswordDTO } from 'src/dtos/changePassword.dto';

@ApiTags('Auth')
@Controller('auth/')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiCreatedResponse({ type: LoginResponseDTO })
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login with username and password' })
  @Post('login')
  async login(
    @Request() req,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() _body: LoginDTO,
  ): Promise<LoginResponseDTO> {
    return this.authService.login(req.user.username, req.user.id);
  }

  @ApiCreatedResponse({ type: UserResponseDTO })
  @ApiOperation({ summary: 'Register a new user' })
  @Post('register')
  async register(@Body() req: RegisterDTO) {
    const result = await this.authService.register(req);

    const mapper = new UserMapper();
    const dto = mapper.convert(result);

    return dto;
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: [UserResponseDTO] })
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async getUsers(@Request() req, @Body() body: ChangePasswordDTO) {
    if (body.password !== body.passwordConfirm)
      throw new HttpException('passwords do not match', 400);

    const result = await this.authService.changePassword(
      req.user.userId,
      body.password,
    );
    const mapper = new UserMapper();

    const dto = mapper.convert(result);
    return dto;
  }
}
