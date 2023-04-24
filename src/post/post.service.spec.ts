import { TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { DataSource } from 'typeorm';
import {
  cleanupDB,
  getTestDataSource,
  getTestModule,
  populateDB,
} from '../utils.test';
import { PostService } from './post.service';
import { CommentMapper, ReplyMapper } from './post.mapper';
import { faker } from '@faker-js/faker';

describe('PostService', () => {
  let app: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await getTestDataSource();
    app = await getTestModule(dataSource);
  });

  afterAll(() => {
    dataSource.destroy();
  });

  beforeEach(async () => {
    await populateDB(app);
  });

  afterEach(async () => {
    await cleanupDB(dataSource);
  });

  it('Create a post', async () => {
    const authService = app.get(AuthService);
    const ownUser = await authService.register({
      username: faker.internet.userName(),
      password: faker.internet.password(),
    });
    const postService = app.get(PostService);
    await postService.createPost(ownUser.id, {
      content: faker.lorem.paragraph(),
      contentType: 'TEXT',
    });

    const posts = await postService.getPosts();
    expect(posts).toHaveLength(1);
  });

  it('Create and Delete a post', async () => {
    const authService = app.get(AuthService);
    const ownUser = await authService.register({
      username: faker.internet.userName(),
      password: faker.internet.password(),
    });
    const postService = app.get(PostService);
    const post = await postService.createPost(ownUser.id, {
      content: faker.lorem.paragraph(),
      contentType: 'TEXT',
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
      username: faker.internet.userName(),
      password: faker.internet.password(),
    });
    const postService = app.get(PostService);
    const post = await postService.createPost(ownUser.id, {
      content: 'Test post',
      contentType: 'TEXT',
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

  it('Check reply type converter', async () => {
    const authService = app.get(AuthService);
    const ownUser = await authService.register({
      username: 'TestUser',
      password: '123',
    });
    const postService = app.get(PostService);
    const post = await postService.createPost(ownUser.id, {
      content: 'Test post',
      contentType: 'TEXT',
    });

    const comment = await postService.createComment(ownUser.id, {
      postId: post.id,
      content: 'Test comment',
    });

    await postService.createReply(ownUser.id, {
      commentId: comment.id,
      content: 'Test reply',
    });

    const replies = await postService.getReplies(comment.id);
    const reply = replies[0];

    const replyMapper = new ReplyMapper();
    const result = replyMapper.convert(reply);

    expect(result).not.toBeNull();
  });

  it('Check comment type converter', async () => {
    const authService = app.get(AuthService);
    const ownUser = await authService.register({
      username: 'TestUser',
      password: '123',
    });
    const postService = app.get(PostService);
    const post = await postService.createPost(ownUser.id, {
      content: 'Test post',
      contentType: 'TEXT',
    });

    const comment = await postService.createComment(ownUser.id, {
      postId: post.id,
      content: 'Test comment',
    });

    await postService.createReply(ownUser.id, {
      commentId: comment.id,
      content: 'Test reply',
    });

    await postService.createReply(ownUser.id, {
      commentId: comment.id,
      content: 'Second reply',
    });

    const comments = await postService.getComments(post.id);
    const testComment = comments[0];

    const commentMapper = new CommentMapper();
    const result = commentMapper.convert(testComment);

    expect(result).not.toBeNull();
  });

  it('Check order on posts', async () => {
    const authService = app.get(AuthService);
    const ownUser = await authService.register({
      username: faker.internet.userName(),
      password: faker.internet.password(),
    });
    const postService = app.get(PostService);
    await postService.createPost(ownUser.id, {
      content: 'Test post 1',
      contentType: 'TEXT',
    });

    // wait for 1 second to make sure the createdAt is different
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await postService.createPost(ownUser.id, {
      content: 'Test post 2',
      contentType: 'TEXT',
    });

    const posts = await postService.getPosts();

    expect(posts[0].content).toBe('Test post 2');
    expect(posts[1].content).toBe('Test post 1');
  });

  it('Check order on comments', async () => {
    const authService = app.get(AuthService);
    const ownUser = await authService.register({
      username: faker.internet.userName(),
      password: faker.internet.password(),
    });
    const postService = app.get(PostService);
    const post = await postService.createPost(ownUser.id, {
      content: 'Test post',
      contentType: 'TEXT',
    });

    await postService.createComment(ownUser.id, {
      postId: post.id,
      content: 'Test comment 1',
    });

    // wait for 1 second to make sure the createdAt is different
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await postService.createComment(ownUser.id, {
      postId: post.id,
      content: 'Test comment 2',
    });

    const posts = await postService.getPosts();

    expect(posts[0].comments[0].content).toBe('Test comment 1');
    expect(posts[0].comments[1].content).toBe('Test comment 2');
  });

  it('Check order on replies', async () => {
    const authService = app.get(AuthService);
    const ownUser = await authService.register({
      username: faker.internet.userName(),
      password: faker.internet.password(),
    });
    const postService = app.get(PostService);
    const post = await postService.createPost(ownUser.id, {
      content: 'Test post',
      contentType: 'TEXT',
    });

    const comment = await postService.createComment(ownUser.id, {
      postId: post.id,
      content: 'Test comment',
    });

    await postService.createReply(ownUser.id, {
      commentId: comment.id,
      content: 'Test reply 1',
    });

    // wait for 1 second to make sure the createdAt is different
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await postService.createReply(ownUser.id, {
      commentId: comment.id,
      content: 'Test reply 2',
    });

    const posts = await postService.getPosts();

    expect(posts[0].comments[0].replies[0].content).toBe('Test reply 1');
    expect(posts[0].comments[0].replies[1].content).toBe('Test reply 2');
  });
});
