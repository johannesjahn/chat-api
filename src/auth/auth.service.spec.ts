import { TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { Connection, DataSource } from 'typeorm';
import {
  cleanupDB,
  getTestDataSource,
  getTestModule,
  populateDB,
} from '../utils.test';
import { UsersService } from '../users/users.service';
import { faker } from '@faker-js/faker';

describe('AuthService', () => {
  let app: TestingModule;
  let dataSource: DataSource;
  let service: UsersService;

  beforeAll(async () => {
    dataSource = await getTestDataSource();
    app = await getTestModule(dataSource);
    service = app.get(UsersService);
  });

  afterAll(() => {
    dataSource.close();
  });

  beforeEach(async () => {
    await populateDB(app);
  });

  afterEach(async () => {
    await cleanupDB(dataSource);
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
