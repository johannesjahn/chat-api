import {
	Body,
	Controller,
	HttpException,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { ChangePasswordDTO } from '../dtos/changePassword.dto';
import { UserResponseDTO } from '../dtos/user.dto';
import { LoginDTO, LoginResponseDTO } from '../dtos/login.dto';
import { RegisterDTO } from '../dtos/register.dto';
import { UserMapper } from '../users/user.mapper';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@ApiTags('Auth')
@Controller('auth/')
export class AuthController {
	constructor(private authService: AuthService) {}

	@ApiCreatedResponse({ type: LoginResponseDTO })
	@UseGuards(LocalAuthGuard)
	@ApiOperation({ description: 'Login with username and password' })
	@Post('login')
	async login(
		@Request() req: any,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		@Body() _body: LoginDTO,
	): Promise<LoginResponseDTO> {
		return this.authService.login(req.user.username, req.user.id);
	}

	@ApiCreatedResponse({ type: UserResponseDTO })
	@ApiOperation({ description: 'Register a new user' })
	@Post('register')
	async register(@Body() req: RegisterDTO) {
		const result = await this.authService.register(req);

		const mapper = new UserMapper();
		const dto = mapper.convert(result);

		return dto;
	}

	@ApiBearerAuth()
	@ApiCreatedResponse({ type: UserResponseDTO })
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ description: 'Change password' })
	@Post('change-password')
	async changePassword(@Request() req: any, @Body() body: ChangePasswordDTO) {
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
