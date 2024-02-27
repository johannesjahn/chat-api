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
		).rejects.toThrow('Http Exception');
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

		const text2 = faker.lorem.paragraph(100);

		await chatService.sendMessage(
			secondUser.id,
			conversation.id,
			text2,
			'TEXT',
		);

		const messages2 = await chatService.getMessages(
			secondUser.id,
			conversation.id,
			undefined,
		);

		expect(messages2.messages.length).toBe(2);
		expect(messages2.messages[1].author.id).toBe(secondUser.id);
		expect(messages2.messages[1].content).toBe(text2);
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

	it('Mark message as read', async () => {
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

		await chatService.markMessageAsRead(secondUser.id, messages.messages[0].id);

		const messages2 = await chatService.getMessages(
			secondUser.id,
			conversation.id,
			undefined,
		);

		expect(messages2.messages[0].readBy.length).toBe(1);
		expect(messages2.messages[0].readBy[0].id).toBe(secondUser.id);
	});

	it('Mark all messages as read', async () => {
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

		await chatService.sendMessage(
			firstUser.id,
			conversation.id,
			faker.lorem.words(100),
			'TEXT',
		);
		await chatService.sendMessage(
			secondUser.id,
			conversation.id,
			faker.lorem.words(100),
			'TEXT',
		);
		await chatService.sendMessage(
			firstUser.id,
			conversation.id,
			faker.lorem.words(100),
			'TEXT',
		);

		await chatService.markConversationAsRead(secondUser.id, conversation.id);

		const messages = await chatService.getMessages(
			secondUser.id,
			conversation.id,
			undefined,
		);

		expect(messages.messages[0].readBy.length).toBe(1);
		expect(messages.messages[0].readBy[0].id).toBe(secondUser.id);

		expect(messages.messages[1].readBy.length).toBe(0);

		expect(messages.messages[2].readBy.length).toBe(1);
		expect(messages.messages[2].readBy[0].id).toBe(secondUser.id);
	});

	it('Check last message read status of conversation list for user', async () => {
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
			secondUser.id,
		);

		await chatService.markConversationAsRead(secondUser.id, conversation.id);

		const conversations2 = await chatService.getConversationListForUser(
			secondUser.id,
		);

		expect(conversations[0].lastMessage?.readBy).toHaveLength(0);
		expect(conversations2[0].lastMessage?.readBy).toHaveLength(1);
		expect(conversations2[0].lastMessage?.readBy[0].id).toBe(secondUser.id);
	});

	it('Get unread messages count', async () => {
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

		const unreadCount = await chatService.getUnreadMessagesCount(secondUser.id);

		await chatService.markMessageAsRead(secondUser.id, messages.messages[0].id);

		const unreadCount2 = await chatService.getUnreadMessagesCount(
			secondUser.id,
		);

		expect(unreadCount).toBe(1);
		expect(unreadCount2).toBe(0);
	});

	it('Has unread messages', async () => {
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

		const unreadCount = await chatService.hasUnreadMessages(secondUser.id);

		await chatService.markMessageAsRead(secondUser.id, messages.messages[0].id);

		const unreadCount2 = await chatService.hasUnreadMessages(secondUser.id);

		expect(unreadCount).toBe(true);
		expect(unreadCount2).toBe(false);
	});

	it('Create conversation for invalid user', async () => {
		const chatService = app.get(ChatService);
		expect(
			chatService.createConversation(1337, {
				partnerIds: [1337],
			}),
		).rejects.toThrow('Http Exception');
	});

	it('Create conversation with invalid user', async () => {
		const authService = app.get(AuthService);
		const theUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});

		const chatService = app.get(ChatService);
		expect(
			chatService.createConversation(1337, {
				partnerIds: [theUser.id],
			}),
		).rejects.toThrow('Http Exception');
	});

	it('Try sending non url image', async () => {
		const authService = app.get(AuthService);
		const theUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});

		const chatService = app.get(ChatService);

		expect(
			chatService.sendMessage(
				theUser.id,
				1337,
				'ftp://exampley.com',
				'IMAGE_URL',
			),
		).rejects.toThrow('Http Exception');
	});

	it('Try sending a message with an invalid user', async () => {
		const chatService = app.get(ChatService);
		await expect(
			chatService.sendMessage(1338, 1337, 'ftp://example.com', 'IMAGE_URL'),
		).rejects.toThrow('Http Exception');
	});

	it('Mark a conversation as read with user not in the conversation', async () => {
		const authService = app.get(AuthService);
		const firstUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});
		const secondUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});
		const invalidUser = await authService.register({
			username: faker.internet.userName(),
			password: faker.internet.password(),
		});

		const chatService = app.get(ChatService);

		const conversation = await chatService.createConversation(firstUser.id, {
			partnerIds: [secondUser.id],
		});

		await expect(
			chatService.markConversationAsRead(invalidUser.id, conversation.id),
		).rejects.toThrow('Http Exception');
	});
});
