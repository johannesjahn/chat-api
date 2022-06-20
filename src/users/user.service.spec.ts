import { TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { Connection } from 'typeorm';
import {
  cleanupDB,
  connectToTestDB,
  getTestModule,
  populateDB,
} from '../utils.test';
import { UsersService } from './users.service';
import { UserMapper } from '../mappers/user.mapper';

describe('UserService', () => {
  let app: TestingModule;
  let dbConnection: Connection;
  let service: UsersService;

  beforeAll(async () => {
    dbConnection = await connectToTestDB();
    app = await getTestModule();
    service = app.get(UsersService);
  });

  afterAll(() => {
    dbConnection.close();
  });

  beforeEach(async () => {
    await populateDB(app);
  });

  afterEach(async () => {
    await cleanupDB(dbConnection);
  });

  it('There should be some users in the system', async () => {
    const users = await service.findAll();
    expect(users).not.toHaveLength(0);
  });

  it('Check find users', async () => {
    const authService = app.get(AuthService);
    const ownUser = await authService.register({
      username: 'TestUser',
      password: '123',
    });
    const usersWithSelf = await service.findAll();
    expect(usersWithSelf).toContainEqual(ownUser);

    const usersWithoutSelf = await service.findAllWithoutSelf(ownUser.id);
    expect(usersWithoutSelf).not.toContainEqual(ownUser);
  });

  it('Check user conversion', async () => {
    const user = await service.findAll();

    const converter = new UserMapper();

    const result = converter.convert(user[0]);

    expect(result).not.toBeNull();
  });
});
