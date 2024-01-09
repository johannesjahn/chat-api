import { TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { DataSource, Repository } from 'typeorm';
import {
	cleanupDB,
	getTestDataSource,
	getTestModule,
	populateDB,
} from '../utils.test';
import { faker } from '@faker-js/faker';
import { ChatService } from './chat.service';
import { HttpException } from '@nestjs/common';
import { MessageMapper } from './chat.mapper';
import { Conversation } from './chat.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ChatService Test', () => {
	let app: TestingModule;
	let dataSource: DataSource;

	beforeAll(async () => {
		dataSource = await getTestDataSource();
		app = await getTestModule(dataSource);
	});

	afterAll(async () => {
		await dataSource.destroy();
	});

	beforeEach(async () => {
		await populateDB(app);
	});

	afterEach(async () => {
		await cleanupDB(dataSource);
	});

	it('Create a Chat', async () => {
		const authService = app.get(AuthService);
		const firstUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});
		const secondUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});
		const thirdUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});

		const chatService = app.get(ChatService);
		await chatService.createConversation(firstUser.id, {
			partnerIds: [secondUser.id],
		});

		const chats = await chatService.getConversationListForUser(firstUser.id);

		expect(chats.length).toBe(1);

		const chats2 = await chatService.getConversationListForUser(secondUser.id);

		expect(chats2.length).toBe(1);

		const chats3 = await chatService.getConversationListForUser(thirdUser.id);

		expect(chats3.length).toBe(0);
	});

	it('Create a chat with own user', async () => {
		const authService = app.get(AuthService);
		const firstUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});
		const chatService = app.get(ChatService);
		expect(
			chatService.createConversation(firstUser.id, {
				partnerIds: [firstUser.id],
			}),
		).rejects.toThrowError('Http Exception');
	});

	it('Create a chat with empty participant list', async () => {
		const authService = app.get(AuthService);
		const firstUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});
		const chatService = app.get(ChatService);
		expect(
			chatService.createConversation(firstUser.id, {
				partnerIds: [],
			}),
		).rejects.toThrow('Http Exception');
	});

	it('Write a message', async () => {
		const authService = app.get(AuthService);
		const firstUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});
		const secondUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});

		const chatService = app.get(ChatService);
		const conversation = await chatService.createConversation(firstUser.id, {
			partnerIds: [secondUser.id],
		});

		const text = faker.lorem.words(100);
		await chatService.sendMessage(firstUser.id, conversation.id, text, 'TEXT');

		const messages = await chatService.getMessages(
			secondUser.id,
			conversation.id,
			undefined,
		);

		expect(messages.messages.length).toBe(1);
		expect(messages.messages[0].author.id).toBe(firstUser.id);
		expect(messages.messages[0].content).toBe(text);

		await chatService.sendMessage(
			secondUser.id,
			conversation.id,
			faker.lorem.paragraph(100),
			'TEXT',
		);

		const messages2 = await chatService.getMessages(
			secondUser.id,
			conversation.id,
			undefined,
		);

		expect(messages2.messages.length).toBe(2);
		expect(messages2.messages[1].author.id).toBe(secondUser.id);
	});

	it('Write a message in a wrong conversation', async () => {
		const authService = app.get(AuthService);
		const firstUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});
		const secondUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});

		const thirdUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});

		const chatService = app.get(ChatService);
		const conversation = await chatService.createConversation(firstUser.id, {
			partnerIds: [secondUser.id],
		});

		const text = faker.lorem.words(100);
		try {
			await chatService.sendMessage(
				thirdUser.id,
				conversation.id,
				text,
				'TEXT',
			);
		} catch (e) {
			expect(e).toBeInstanceOf(HttpException);
		}
	});

	it('Check if last message updates correctly', async () => {
		const authService = app.get(AuthService);
		const firstUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});
		const secondUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});

		const chatService = app.get(ChatService);
		const conversation = await chatService.createConversation(firstUser.id, {
			partnerIds: [secondUser.id],
		});

		const text = faker.lorem.words(100);
		await chatService.sendMessage(firstUser.id, conversation.id, text, 'TEXT');

		const messages = await chatService.getMessages(
			secondUser.id,
			conversation.id,
		);

		const conversationRepo: Repository<Conversation> = app.get(
			getRepositoryToken(Conversation),
		);
		const firstMessageSent = await conversationRepo.find({
			where: { id: conversation.id },
			relations: ['lastMessage'],
		});

		expect(messages.messages).toHaveLength(1);

		// wait for 1 second to make sure the timestamp is different
		await new Promise((resolve) => setTimeout(resolve, 1000));

		await chatService.sendMessage(firstUser.id, conversation.id, text, 'TEXT');

		const secondMessageSent = await conversationRepo.find({
			where: { id: conversation.id },
			relations: ['lastMessage'],
		});

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		expect(firstMessageSent[0].lastMessage!.id).not.toBe(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			secondMessageSent[0].lastMessage!.id,
		);
		expect(
			firstMessageSent[0].updatedAt.getTime() -
				secondMessageSent[0].updatedAt.getTime(),
		).toBeLessThan(0);
	});

	it('Get not found (404) if conversation not exists', async () => {
		const authService = app.get(AuthService);
		const firstUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});
		const chatService = app.get(ChatService);
		try {
			await chatService.getMessages(firstUser.id, 1337);
		} catch (e: any) {
			expect(e).toBeDefined();
			expect(e).toHaveProperty('status');
			expect(e['status']).toBe(404);
		}
	});

	it('Check message converter', async () => {
		const authService = app.get(AuthService);
		const firstUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});
		const secondUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});

		const chatService = app.get(ChatService);
		const conversation = await chatService.createConversation(firstUser.id, {
			partnerIds: [secondUser.id],
		});

		const text = faker.lorem.paragraph(100);
		await chatService.sendMessage(firstUser.id, conversation.id, text, 'TEXT');

		await chatService.sendMessage(
			secondUser.id,
			conversation.id,
			faker.lorem.paragraph(100),
			'TEXT',
		);

		const messages = await chatService.getMessages(
			secondUser.id,
			conversation.id,
			undefined,
		);

		const mapper = new MessageMapper();
		const dtos = messages.messages.map((v) => mapper.convert(v));

		expect(dtos.length).toBe(messages.messages.length);
	});

	it('Check last message in a conversation', async () => {
		const authService = app.get(AuthService);
		const firstUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});
		const secondUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});

		const chatService = app.get(ChatService);
		const conversation = await chatService.createConversation(firstUser.id, {
			partnerIds: [secondUser.id],
		});

		const text = faker.lorem.words(100);
		await chatService.sendMessage(firstUser.id, conversation.id, text, 'TEXT');

		const messages = await chatService.getMessages(
			secondUser.id,
			conversation.id,
			undefined,
		);

		expect(messages.lastMessage?.author.id).toBe(firstUser.id);

		await chatService.sendMessage(
			secondUser.id,
			conversation.id,
			faker.lorem.paragraph(100),
			'TEXT',
		);

		const messages2 = await chatService.getMessages(
			secondUser.id,
			conversation.id,
			undefined,
		);

		expect(messages2.lastMessage?.author.id).toBe(secondUser.id);
	});

	it('Check last message of conversation list for user', async () => {
		const authService = app.get(AuthService);
		const firstUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});
		const secondUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});

		const chatService = app.get(ChatService);
		const conversation = await chatService.createConversation(firstUser.id, {
			partnerIds: [secondUser.id],
		});

		const text = faker.lorem.words(100);
		await chatService.sendMessage(firstUser.id, conversation.id, text, 'TEXT');

		const conversations = await chatService.getConversationListForUser(
			firstUser.id,
		);

		expect(conversations[0].lastMessage?.author.id).toBe(firstUser.id);
	});
});
