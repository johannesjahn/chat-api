import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthService } from './auth/auth.service';
import { jwtConstants } from './auth/constants';
import { Conversation, Message } from './chat/chat.entity';
import { ChatService } from './chat/chat.service';
import { Post, Comment, Reply } from './post/post.entity';
import { PostService } from './post/post.service';
import { User } from './users/user.entity';
import { UserAuth } from './users/userAuth.entity';
import { UsersService } from './users/users.service';

export const getTestDataSource = async () => {
  const ds = await new DataSource({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: ['./**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: false,
    name: 'default',
  }).initialize();

  return ds;
};

export const getTestModule = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);
  const authRepository = dataSource.getRepository(UserAuth);

  const postRepository = dataSource.getRepository(Post);
  const commentRepository = dataSource.getRepository(Comment);
  const replyRepository = dataSource.getRepository(Reply);

  const conversationRepository = dataSource.getRepository(Conversation);
  const messageRepository = dataSource.getRepository(Message);

  return await Test.createTestingModule({
    imports: [
      JwtModule.register({
        secret: jwtConstants.secret,
        signOptions: {},
      }),
    ],
    providers: [
      {
        provide: getRepositoryToken(User),
        useValue: userRepository,
      },
      {
        provide: getRepositoryToken(UserAuth),
        useValue: authRepository,
      },
      {
        provide: getRepositoryToken(Post),
        useValue: postRepository,
      },
      {
        provide: getRepositoryToken(Comment),
        useValue: commentRepository,
      },
      {
        provide: getRepositoryToken(Reply),
        useValue: replyRepository,
      },
      {
        provide: getRepositoryToken(Conversation),
        useValue: conversationRepository,
      },
      {
        provide: getRepositoryToken(Message),
        useValue: messageRepository,
      },
      UsersService,
      AuthService,
      PostService,
      ChatService,
    ],
  }).compile();
};

export const populateDB = async (app: TestingModule) => {
  const service = app.get(AuthService);
  await service.register({
    username: 'Nachobar',
    password: '123',
  });
  await service.register({
    username: 'Nachobar2',
    password: '123',
  });
};

export const cleanupDB = async (dataSource: DataSource) => {
  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name); // Get repository
    await repository.clear(); // Clear each entity table's content
  }
};
