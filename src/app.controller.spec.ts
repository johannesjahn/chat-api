import { TestingModule } from '@nestjs/testing';
import { Connection } from 'typeorm';
import { UserAuth } from './users/userAuth.entity';
import {
  cleanupDB,
  connectToTestDB,
  getTestModule,
  populateDB,
} from './utils.test';

describe('AppController', () => {
  let app: TestingModule;
  let dbConnection: Connection;

  beforeAll(async () => {
    dbConnection = await connectToTestDB();
    app = await getTestModule();
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

  it('should return "Hello World!"', () => {
    //expect(appController.getHello()).toBe('Hello World!');
  });
  it('check Login', async () => {
    const repo = dbConnection.getRepository(UserAuth);
    const result = await repo.find();
    expect(result).not.toHaveLength(0);
  });
});
