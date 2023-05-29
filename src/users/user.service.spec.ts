import { TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { DataSource } from 'typeorm';
import {
  cleanupDB,
  getTestDataSource,
  getTestModule,
  populateDB,
} from '../utils.test';
import { UsersService } from './users.service';
import { UserMapper } from './user.mapper';
import { faker } from '@faker-js/faker';

describe('UserService', () => {
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

  it('Check find users', async () => {
    const authService = app.get(AuthService);
    const ownUser = await authService.register({
      username: faker.internet.userName(),
      password: faker.internet.password(),
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
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('username');
  });
});
