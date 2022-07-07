import { TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { UserAuth } from './users/userAuth.entity';
import {
  cleanupDB,
  getTestDataSource,
  getTestModule,
  populateDB,
} from './utils.test';

describe('AppController', () => {
  let app: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await getTestDataSource();
    app = await getTestModule(dataSource);
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

  it('check Login', async () => {
    const repo = dataSource.getRepository(UserAuth);
    const result = await repo.find();
    expect(result).not.toHaveLength(0);
  });
});
