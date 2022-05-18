import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { exception } from 'console';
import { RegisterDTO } from 'src/dtos/register.dto';
import { User } from 'src/users/user.entity';
import { UserAuth } from 'src/users/userAuth.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { hashConstants } from './constants';

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

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username: username },
      relations: ['userAuth'],
    });
    if (user && (await compare(pass, user.userAuth.password))) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDTO: RegisterDTO) {
    const user = await this.usersService.findUser(registerDTO.username);
    if (user) throw exception('Username is already taken');
    const pw = await hash(registerDTO.password, hashConstants.saltRounds);
    const auth = new UserAuth();
    auth.password = pw;
    const userAuthSaved = await this.userAuthRepository.save(auth);
    const nUser = new User();
    nUser.username = registerDTO.username;
    nUser.userAuth = userAuthSaved;
    await this.userRepository.save(nUser);
    const { userAuth, ...result } = nUser;
    return result;
  }
}
