import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { faker } from '@faker-js/faker';
import { CreateConversationRequestDTO } from '../src/dtos/conversation.dto';
import { ConversationResponseDTO } from '../src/dtos/chat.dto';

describe('ChatController (e2e)', () => {
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

	async function createAccount(): Promise<{
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

	it('app/chat/create-conversation (single chat) (POST)', async () => {
		const firstCredentials = await createAccount();
		const secondCredentials = await createAccount();

		const createConversationRequestDTO: CreateConversationRequestDTO = {
			partnerIds: [secondCredentials.id],
		};

		await request(app.getHttpServer())
			.post('/chat/create-conversation')
			.set('Authorization', `Bearer ${firstCredentials.accessToken}`)
			.send(createConversationRequestDTO);

		const firstResponse = await request(app.getHttpServer())
			.get('/chat/get-conversations')
			.set('Authorization', `Bearer ${firstCredentials.accessToken}`)
			.send();

		const secondResponse = await request(app.getHttpServer())
			.get('/chat/get-conversations')
			.set('Authorization', `Bearer ${secondCredentials.accessToken}`)
			.send();

		expect(firstResponse.body as ConversationResponseDTO[]).toHaveLength(1);
		expect(secondResponse.body as ConversationResponseDTO[]).toHaveLength(1);
	});

	it('app/chat/create-conversation (multi chat) (POST)', async () => {
		const firstCredentials = await createAccount();
		const secondCredentials = await createAccount();
		const thirdCredentials = await createAccount();

		const createConversationRequestDTO: CreateConversationRequestDTO = {
			partnerIds: [secondCredentials.id, thirdCredentials.id],
		};

		await request(app.getHttpServer())
			.post('/chat/create-conversation')
			.set('Authorization', `Bearer ${firstCredentials.accessToken}`)
			.send(createConversationRequestDTO);

		const firstResponse = await request(app.getHttpServer())
			.get('/chat/get-conversations')
			.set('Authorization', `Bearer ${firstCredentials.accessToken}`)
			.send();

		const secondResponse = await request(app.getHttpServer())
			.get('/chat/get-conversations')
			.set('Authorization', `Bearer ${secondCredentials.accessToken}`)
			.send();

		const thirdResponse = await request(app.getHttpServer())
			.get('/chat/get-conversations')
			.set('Authorization', `Bearer ${thirdCredentials.accessToken}`)
			.send();

		expect(firstResponse.body as ConversationResponseDTO[]).toHaveLength(1);
		expect(secondResponse.body as ConversationResponseDTO[]).toHaveLength(1);
		expect(thirdResponse.body as ConversationResponseDTO[]).toHaveLength(1);

		expect(
			(firstResponse.body as ConversationResponseDTO[])[0].participants,
		).toHaveLength(3);
		expect(
			(secondResponse.body as ConversationResponseDTO[])[0].participants,
		).toHaveLength(3);
		expect(
			(thirdResponse.body as ConversationResponseDTO[])[0].participants,
		).toHaveLength(3);
	});
});
