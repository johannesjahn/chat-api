import { faker } from '@faker-js/faker';
import * as request from 'supertest';
import { app } from './setup.e2e';

export async function createAccount(): Promise<{
	username: string;
	password: string;
	accessToken: string;
	id: number;
}> {
	const username = faker.internet.userName();
	const password = faker.internet.password();

	const registerResponse = await request(app.getHttpServer())
		.post('/auth/register')
		.send({ username, password });

	const id = registerResponse.body.id;

	const loginResponse = await request(app.getHttpServer())
		.post('/auth/login')
		.send({ username, password });

	const accessToken = loginResponse.body.access_token;

	return { id, username, password, accessToken };
}
