import { TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { UserAuth } from './users/userAuth.entity';
import {
	cleanupDB,
	getTestDataSource,
	getTestModule,
	populateDB,
} from './utils.test';
import { AppService } from './app.service';

describe('AppService', () => {
	let app: TestingModule;
	let dataSource: DataSource;

	beforeAll(async () => {
		dataSource = await getTestDataSource();
		app = await getTestModule(dataSource);
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

	it('check Login', async () => {
		const repo = dataSource.getRepository(UserAuth);
		const result = await repo.find();
		expect(result).not.toHaveLength(0);
	});

	it('check Version', async () => {
		const appService = app.get(AppService);
		expect(appService.getVersion().length).toBeGreaterThan(0);
	});

	it('test Debug', async () => {
		const appService = app.get(AppService);
		const result = await appService.debug();
		expect(result).toBe('Thanks for using the debug endpoint.');
	});
});
