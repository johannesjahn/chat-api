import * as request from 'supertest';
import { ConversationResponseDTO } from '../src/dtos/chat.dto';
import { CreateConversationRequestDTO } from '../src/dtos/conversation.dto';
import { app } from './setup.e2e';
import { createAccount } from './utils.e2e';

describe('ChatController (e2e)', () => {
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
