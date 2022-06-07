import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, createConnection, getRepository } from 'typeorm';
import { AuthService } from './auth/auth.service';
import { jwtConstants } from './auth/constants';
import { User } from './users/user.entity';
import { UserAuth } from './users/userAuth.entity';
import { UsersService } from './users/users.service';

export const connectToTestDB = async () => {
  return await createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: ['./**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: false,
    name: 'default',
  });
};

export const getTestModule = async () => {
  const userRepository = getRepository(User, 'default');
  const authRepository = getRepository(UserAuth, 'default');

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
      UsersService,
      AuthService,
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

export const cleanupDB = async (dbConnection: Connection) => {
  const entities = dbConnection.entityMetadatas;

  for (const entity of entities) {
    const repository = dbConnection.getRepository(entity.name); // Get repository
    await repository.clear(); // Clear each entity table's content
  }
};
