import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('/ (GET)', async () => {
		return await request(app.getHttpServer())
			.get('/')
			.expect(200)
			.expect('Hello World!');
	});

	it('/auth/login (POST', async () => {
		const result = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ username: 'Nachobar', password: '12345678' });

		expect(result.body.access_token).toBeDefined();
		expect(result.statusCode).toBe(201);
	});
});
