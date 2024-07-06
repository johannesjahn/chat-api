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

	it('/auth/register (POST)', async () => {
		const response = await request(app.getHttpServer())
			.post('/auth/register')
			.send({ username: 'Nachobar', password: '12345678' });
		expect(response.statusCode).toBe(201);
	});

	it('/auth/login (POST) - correct credentials', async () => {
		await request(app.getHttpServer())
			.post('/auth/register')
			.send({ username: 'Nachobar', password: '12345678' });

		const response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ username: 'Nachobar', password: '12345678' });
		expect(response.statusCode).toBe(201);
		expect(response.body).toHaveProperty('access_token');
	});

	it('/auth/login (POST) - wrong credentials', async () => {
		const response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ username: 'Nachobar', password: '12345678' });

		expect(response.statusCode).toBe(401);
	});
});
