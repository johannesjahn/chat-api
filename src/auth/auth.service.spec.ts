import { TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { Connection } from 'typeorm';
import {
  cleanupDB,
  connectToTestDB,
  getTestModule,
  populateDB,
} from '../utils.test';
import { UsersService } from '../users/users.service';
import { faker } from '@faker-js/faker';

describe('AuthService', () => {
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

  it('Check Login', async () => {
    const authService = app.get(AuthService);

    const username = faker.internet.userName();
    const password = faker.internet.password();

    const ownUser = await authService.register({
      username: username,
      password: password,
    });

    await authService.validateUser(username, password);
  });
});
