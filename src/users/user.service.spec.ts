import { TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { DataSource } from 'typeorm';
import {
	cleanupDB,
	getTestDataSource,
	getTestModule,
	populateDB,
} from '../utils.test';
import { UsersService } from './users.service';
import { UserMapper } from './user.mapper';
import { faker } from '@faker-js/faker';

describe('UserService', () => {
	let app: TestingModule;
	let dataSource: DataSource;
	let service: UsersService;

	beforeAll(async () => {
		dataSource = await getTestDataSource();
		app = await getTestModule(dataSource);
		service = app.get(UsersService);
	});

	afterAll(() => {
		dataSource.destroy();
	});

	beforeEach(async () => {
		await populateDB(app);
	});

	afterEach(async () => {
		await cleanupDB(dataSource);
	});

	it('There should be some users in the system', async () => {
		const users = await service.findAll();
		expect(users).not.toHaveLength(0);
	});

	it('Check find users', async () => {
		const authService = app.get(AuthService);
		const ownUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const usersWithSelf = await service.findAll();
		expect(usersWithSelf).toContainEqual(ownUser);
	});

	it('Check find users without self', async () => {
		const authService = app.get(AuthService);
		const ownUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});

		const usersWithoutSelf = await service.findAllWithoutSelf(ownUser.id);
		expect(usersWithoutSelf).not.toContainEqual(ownUser);
	});

	it('Check user conversion', async () => {
		const user = await service.findAll();

		const converter = new UserMapper();

		const result = converter.convert(user[0]);
		expect(result).not.toBeNull();
		expect(result).toHaveProperty('id');
		expect(result).toHaveProperty('username');
	});

	it('Check find one user', async () => {
		const allUsers = await service.findAll();
		const theUser = await service.findOne(allUsers[0].id);
		expect(theUser).not.toBeNull();
		expect(theUser!.id).toBe(allUsers[0].id);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		expect(theUser!.username).toBe(allUsers[0].username);
	});

	it('Check set avatar hash', async () => {
		const allUsers = await service.findAll();
		const user = allUsers[0];
		const avatarHash = faker.string.alphanumeric(32);
		await service.setAvatarHash(user.id, avatarHash);
		const updatedUser = await service.findOne(user.id);
		expect(updatedUser).not.toBeNull();
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		expect(updatedUser!.avatarHash).toBe(avatarHash);
	});
});
