import { faker } from '@faker-js/faker';
import { TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { cleanupDB, getTestDataSource, getTestModule, populateDB } from '../utils.test';

describe('AuthService', () => {
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

	it('Test login', async () => {
		const authService = app.get(AuthService);

		const username = faker.internet.username();
		const password = faker.internet.password();

		await authService.register({
			username: username,
			password: password,
		});

		const user = await authService.validateUser(username, password);
		const result = await authService.login(username, user!.id);

		expect(user).not.toBeNull();
		expect(result).toHaveProperty('access_token');
	});

	it('There should be some users in the system', async () => {
		const users = await service.findAll();
		expect(users).not.toHaveLength(0);
	});

	it('Check Login', async () => {
		const authService = app.get(AuthService);

		const username = faker.internet.username();
		const password = faker.internet.password();

		await authService.register({
			username: username,
			password: password,
		});

		const user = await authService.validateUser(username, password);
		expect(user).not.toBeNull();
	});

	it('Check Login with invalid credentials', async () => {
		const authService = app.get(AuthService);

		const username = faker.internet.username();
		const password = faker.internet.password();

		await authService.register({
			username: username,
			password: 'wrong password',
		});

		const user = await authService.validateUser(username, password);
		expect(user).toBeNull();
	});

	it('Check password change', async () => {
		const authService = app.get(AuthService);

		const username = faker.internet.username();
		const password = faker.internet.password();
		const newPassword = faker.internet.password();

		await authService.register({
			username: username,
			password: password,
		});

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const user = (await authService.validateUser(username, password))!;

		await authService.changePassword(user.id, newPassword);

		const result = await authService.validateUser(username, newPassword);
		expect(result).not.toBeNull();

		await expect(authService.validateUser(username, password)).resolves.toBeNull();
	});

	it('Set password to the same value', async () => {
		const authService = app.get(AuthService);

		const username = faker.internet.username();
		const password = faker.internet.password();

		await authService.register({
			username: username,
			password: password,
		});

		const user = (await authService.validateUser(username, password))!;

		await expect(authService.changePassword(user.id, password)).rejects.toThrow('Http Exception');
	});
});
