import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	it('/debug (GET)', async () => {
		const response = await request(app.getHttpServer())
			.get('/debug')
			.expect(200)
			.expect(
				(res) =>
					res.body ===
					JSON.stringify({ message: 'Thanks for using the debug endpoint.' }),
			);
		return response;
	});
});
