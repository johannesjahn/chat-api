import { TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { DataSource } from 'typeorm';
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

describe('ChatService', () => {
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

    const chatService = app.get(ChatService);
    await chatService.createOne(firstUser.id, { partnerId: secondUser.id });

    const chats = await chatService.getConversationListForUser(firstUser.id);

    expect(chats.length).toBe(1);

    const chats2 = await chatService.getConversationListForUser(secondUser.id);

    expect(chats2.length).toBe(1);
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
    const conversation = await chatService.createOne(firstUser.id, {
      partnerId: secondUser.id,
    });

    const text = faker.random.words(100);
    await chatService.sendMessage(firstUser.id, conversation.id, text, 'TEXT');

    const messages = await chatService.getMessages(
      secondUser.id,
      conversation.id,
      null,
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
      null,
    );

    expect(messages2.messages.length).toBe(2);
    expect(messages2.messages[1].author.id).toBe(secondUser.id);
  });

  it('Write a message in the wrong conversation', async () => {
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
    const conversation = await chatService.createOne(firstUser.id, {
      partnerId: secondUser.id,
    });

    const text = faker.random.words(100);
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
    const conversation = await chatService.createOne(firstUser.id, {
      partnerId: secondUser.id,
    });

    const text = faker.random.words(100);
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
      null,
    );

    const mapper = new MessageMapper();
    const dtos = messages.messages.map((v) => mapper.convert(v));

    expect(dtos.length).toBe(messages.messages.length);
  });
});
