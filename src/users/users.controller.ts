import {
	Controller,
	Get,
	HttpException,
	Param,
	Post,
	Query,
	Request,
	StreamableFile,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserResponseDTO } from '../dtos/user.dto';
import { UserMapper } from './user.mapper';
import { UsersService } from './users.service';
import { encode } from 'blurhash';

@ApiTags('User')
@ApiCreatedResponse({ type: [UserResponseDTO] })
@Controller('user')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@ApiBearerAuth()
	@ApiCreatedResponse({ type: [UserResponseDTO] })
	@ApiOperation({ description: 'Get all users without self' })
	@UseGuards(JwtAuthGuard)
	@Get()
	async getUsers(@Request() req: any) {
		const result = await this.usersService.findAllWithoutSelf(req.user.userId);
		const mapper = new UserMapper();

		const dtos = result.map((u) => mapper.convert(u));
		return dtos;
	}

	@ApiBearerAuth()
	@ApiCreatedResponse({ type: UserResponseDTO })
	@ApiOperation({ description: 'Get current authenticated user' })
	@UseGuards(JwtAuthGuard)
	@Get('me')
	async getMe(@Request() req: any) {
		const result = await this.usersService.findOne(req.user.userId);
		const mapper = new UserMapper();

		if (!result) {
			throw new HttpException({ error: 'User not found' }, 404);
		}

		const dto = mapper.convert(result);
		return dto;
	}

	@ApiBearerAuth()
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	@ApiCreatedResponse()
	@Post('upload-avatar')
	@ApiOperation({ description: 'Upload avatar for current authenticated user' })
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('file'))
	async uploadAvatar(
		@UploadedFile()
		file: Express.Multer.File,
		@Request() req: any,
	) {
		const userId: string = req.user.userId;

		await Promise.all([
			sharp(file.buffer)
				.resize(800)
				.webp({ effort: 6, quality: 30 })
				.toFile(path.join('avatars', userId + '_800.webp')),
			sharp(file.buffer)
				.resize(400)
				.webp({ effort: 6, quality: 30 })
				.toFile(path.join('avatars', userId + '_400.webp')),
			sharp(file.buffer)
				.resize(200)
				.webp({ effort: 6, quality: 30 })
				.toFile(path.join('avatars', userId + '_200.webp')),
			sharp(file.buffer)
				.resize(64, 64)
				.ensureAlpha()
				.raw()
				.toBuffer()
				.then(async (buf) => {
					const encoded = encode(new Uint8ClampedArray(buf), 64, 64, 4, 4);
					await this.usersService.setAvatarHash(parseInt(userId), encoded);
				}),
		]);

		return userId;
	}

	validSizes = ['200', '400', '800'];

	@Get('avatar/:userId')
	@ApiOperation({ description: 'Get avatar for a specific user' })
	async getAvatar(@Param('userId') userId: number, @Query('size') size = '200') {
		if (!this.validSizes.includes(size)) {
			throw new HttpException({ error: 'invalid size' }, 400);
		}

		let file: fs.ReadStream;
		if (fs.existsSync('avatars/' + userId + '_' + size + '.webp')) {
			file = fs.createReadStream('avatars/' + userId + '_' + size + '.webp');
		} else {
			file = fs.createReadStream('res/default' + '_' + size + '.webp');
		}
		return new StreamableFile(file, { type: 'image/webp' });
	}
}
