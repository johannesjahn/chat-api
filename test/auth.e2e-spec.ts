import * as request from 'supertest';
import { app } from './setup.e2e';
import { faker } from '@faker-js/faker';

describe('AuthController (e2e)', () => {
	const username = faker.internet.username();
	const password = faker.internet.password();
	const otherPassword = faker.internet.password();

	it('/auth/register (POST)', async () => {
		const response = await request(app.getHttpServer())
			.post('/auth/register')
			.send({ username, password });
		expect(response.statusCode).toBe(201);
	});

	it('/auth/login (POST) - correct credentials', async () => {
		await request(app.getHttpServer())
			.post('/auth/register')
			.send({ username, password });

		const response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ username, password });
		expect(response.statusCode).toBe(201);
		expect(response.body).toHaveProperty('access_token');
	});

	it('/auth/login (POST) - wrong credentials', async () => {
		const response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ username, password });

		expect(response.statusCode).toBe(401);
	});

	it('/auth/change-password (POST) - change password', async () => {
		await request(app.getHttpServer())
			.post('/auth/register')
			.send({ username, password });

		const loginResponse = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ username, password });

		const changePasswordResponse = await request(app.getHttpServer())
			.post('/auth/change-password')
			.set('Authorization', `Bearer ${loginResponse.body.access_token}`)
			.send({ password: otherPassword, passwordConfirm: otherPassword });

		const secondLoginResponse = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ username, password: otherPassword });

		const thirdLoginResponse = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ username, password });

		expect(changePasswordResponse.statusCode).toBe(201);
		expect(secondLoginResponse.statusCode).toBe(201);
		expect(thirdLoginResponse.statusCode).toBe(401);
	});
});
