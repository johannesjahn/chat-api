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

	it('/ (GET)', async () => {
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

	it('/auth/register (POST)', async () => {
		const response = await request(app.getHttpServer())
			.post('/auth/register')
			.send({ username: 'Nachobar', password: '12345678' });
		expect(response.statusCode).toBe(201);
	});

	it('/auth/login (POST)', async () => {
		await request(app.getHttpServer())
			.post('/auth/register')
			.send({ username: 'Nachobar', password: '12345678' });

		const response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ username: 'Nachobar', password: '12345678' });
		expect(response.statusCode).toBe(201);
	});
});
