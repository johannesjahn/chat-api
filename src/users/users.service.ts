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

	/**
	 * Find all users
	 * @returns All users
	 */
	findAll(): Promise<User[]> {
		return this.usersRepository.find();
	}

	/**
	 * Find all users except the user with the given id
	 * @param userId The id of the user to exclude
	 * @returns All users except the user with the given id
	 */
	async findAllWithoutSelf(userId: number): Promise<User[]> {
		return this.usersRepository
			.createQueryBuilder()
			.where('id != :id', { id: userId })
			.getMany();
	}

	/**
	 * Find one user by id
	 * @param id The id of the user to find
	 * @returns The user with the given id
	 */
	findOne(id: number): Promise<User | null> {
		return this.usersRepository.findOne({ where: { id: id } });
	}

	/**
	 * Find user by username
	 * @param username THe username of the user to find
	 * @returns The user with the given username
	 */
	async findUser(username: string): Promise<User> {
		const result = await this.usersRepository.find({
			where: { username: username },
		});
		return result[0];
	}
}
