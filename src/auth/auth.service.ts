import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDTO } from '../dtos/register.dto';
import { User } from '../users/user.entity';
import { UserAuth } from '../users/userAuth.entity';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { hashConstants } from './constants';
import { createHmac } from 'node:crypto';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(UserAuth)
		private userAuthRepository: Repository<UserAuth>,
	) {}

	async validateUser(username: string, pass: string): Promise<User | null> {
		const user = await this.userRepository.findOne({
			where: { username: username },
			relations: ['userAuth'],
		});
		const hash = createHmac('sha256', hashConstants.salt()).update(pass).digest('hex');
		if (user && user.userAuth && user.userAuth.password === hash) {
			return user;
		}
		return null;
	}

	async login(username: string, id: number) {
		const payload = { username: username, sub: id };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async changePassword(id: number, password: string) {
		const user = await this.userRepository.findOne({
			where: { id },
			relations: ['userAuth'],
		});
		if (!user) throw new HttpException({ error: 'User not found' }, 400);
		if (!user.userAuth) {
			throw new HttpException({ error: 'Error updating password' }, 500);
		}
		const hash = createHmac('sha256', hashConstants.salt()).update(password).digest('hex');
		if (user.userAuth.password == hash) {
			throw new HttpException({ error: "Password can't be the same" }, 400);
		}

		user.userAuth.password = createHmac('sha256', hashConstants.salt()).update(password).digest('hex');
		await this.userAuthRepository.save(user.userAuth);
		delete user.userAuth;
		return user;
	}

	async register(registerDTO: RegisterDTO) {
		const user = await this.usersService.findUser(registerDTO.username);
		if (user) throw new HttpException({ error: 'User already exists' }, 400);

		const pw = createHmac('sha256', hashConstants.salt()).update(registerDTO.password).digest('hex');
		const auth = new UserAuth();
		auth.password = pw;
		const userAuthSaved = await this.userAuthRepository.save(auth);
		const nUser = new User();
		nUser.username = registerDTO.username;
		nUser.userAuth = userAuthSaved;
		await this.userRepository.save(nUser);
		// just filtering the userAuth properties here
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		delete nUser.userAuth;
		return nUser;
	}
}
