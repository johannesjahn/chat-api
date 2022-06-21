import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findAllWithoutSelf(userId: number): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder()
      .where('id != :id', { id: userId })
      .getMany();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id: id } });
  }

  async findUser(username: string): Promise<User> {
    const result = await this.usersRepository.find({
      where: { username: username },
    });
    return result[0];
  }

  async findAny(): Promise<User> {
    const user = await this.usersRepository.find({ take: 1 });
    return user.length > 0 ? user[0] : null;
  }

  async insert(user: User): Promise<void> {
    await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
