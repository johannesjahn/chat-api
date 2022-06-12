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
import { PostService } from './post.service';

describe('PostService', () => {
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

  it('Create and Delete post', async () => {
    const authService = app.get(AuthService);
    const ownUser = await authService.register({
      username: 'TestUser',
      password: '123',
    });
    const postService = app.get(PostService);
    const post = await postService.createPost(ownUser.id, {
      content: 'Test post',
    });

    const posts = await postService.getPosts();
    expect(posts).toHaveLength(1);

    await postService.deletePost(ownUser.id, post.id);

    const postsAfterDelete = await postService.getPosts();
    expect(postsAfterDelete.length).toBe(0);
  });

  it('Check if can create post, comment, and reply to the comment', async () => {
    const authService = app.get(AuthService);
    const ownUser = await authService.register({
      username: 'TestUser',
      password: '123',
    });
    const postService = app.get(PostService);
    const post = await postService.createPost(ownUser.id, {
      content: 'Test post',
    });

    const comment = await postService.createComment(ownUser.id, {
      postId: post.id,
      content: 'Test comment',
    });

    await postService.createReply(ownUser.id, {
      commentId: comment.id,
      content: 'Test reply',
    });

    const posts = await postService.getPosts();

    expect(posts[0].content).toBe('Test post');
    expect(posts[0].comments[0].content).toBe('Test comment');
    expect(posts[0].comments[0].replies[0].content).toBe('Test reply');

    await postService.deletePost(ownUser.id, post.id);

    const postsAfterDelete = await postService.getPosts();
    expect(postsAfterDelete.length).toBe(0);
  });
});
