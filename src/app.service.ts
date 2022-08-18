import { Injectable } from '@nestjs/common';
import { User } from './users/user.entity';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService {
  constructor(private usersService: UsersService) {}

  getHello(): string {
    return 'Testing the deployment';
  }

  getFirstUser(): Promise<User> {
    return this.usersService.findAny();
  }

  async getUser(user: any) {
    return await this.usersService.findOne(user.userId);
  }
}
