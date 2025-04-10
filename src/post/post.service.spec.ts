/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { DataSource } from 'typeorm';
import { cleanupDB, getTestDataSource, getTestModule, populateDB } from '../utils.test';
import { PostService } from './post.service';
import { CommentMapper, ReplyMapper } from './post.mapper';
import { faker } from '@faker-js/faker';
import { ContentTypeValues } from '../chat/chat.entity';
import { HttpException } from '@nestjs/common';

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
			username: faker.internet.username(),
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

	it('Create and delete a post.', async () => {
		const authService = app.get(AuthService);
		const ownUser = await authService.register({
			username: faker.internet.username(),
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

	it('Create and update a post', async () => {
		const authService = app.get(AuthService);
		const ownUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const postService = app.get(PostService);
		const post = await postService.createPost(ownUser.id, {
			content: faker.lorem.paragraph(),
			contentType: ContentTypeValues[0],
		});

		const posts = await postService.getPosts();
		expect(posts).toHaveLength(1);
		expect(posts[0].content).toBe(post.content);

		const updatedContent = faker.lorem.paragraph();
		await postService.updatePost(ownUser.id, {
			id: post.id,
			content: updatedContent,
			contentType: ContentTypeValues[0],
		});

		const postsAfterUpdate = await postService.getPosts();
		expect(postsAfterUpdate.length).toBe(1);
		expect(postsAfterUpdate[0].content).toBe(updatedContent);
	});

	it('Create post, comment, and update comment.', async () => {
		const authService = app.get(AuthService);
		const ownUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const postService = app.get(PostService);

		const postContent = faker.lorem.paragraph();
		const post = await postService.createPost(ownUser.id, {
			content: postContent,
			contentType: 'TEXT',
		});

		const commentContent = faker.lorem.paragraph();
		const comment = await postService.createComment(ownUser.id, {
			postId: post.id,
			content: commentContent,
		});

		const posts = await postService.getPosts();

		expect(posts[0].content).toBe(postContent);
		expect(posts[0].comments[0].content).toBe(commentContent);

		const updatedComment = faker.lorem.paragraph();
		await postService.updateComment(ownUser.id, comment.id, updatedComment);

		const postsAfterUpdate = await postService.getPosts();
		expect(postsAfterUpdate.length).toBe(1);
		expect(postsAfterUpdate[0].comments[0].content).toBe(updatedComment);
	});

	it('Create post, comment, and delete comment', async () => {
		const authService = app.get(AuthService);
		const ownUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const postService = app.get(PostService);

		const postContent = faker.lorem.paragraph();
		const post = await postService.createPost(ownUser.id, {
			content: postContent,
			contentType: 'TEXT',
		});

		const commentContent = faker.lorem.paragraph();
		const comment = await postService.createComment(ownUser.id, {
			postId: post.id,
			content: commentContent,
		});

		const posts = await postService.getPosts();

		expect(posts[0].content).toBe(postContent);
		expect(posts[0].comments[0].content).toBe(commentContent);

		await postService.deleteComment(ownUser.id, comment.id);

		const postsAfterUpdate = await postService.getPosts();
		expect(postsAfterUpdate.length).toBe(1);
		expect(postsAfterUpdate[0].comments.length).toBe(0);
	});

	it('Try to delete a non existing comment', async () => {
		const postService = app.get(PostService);
		await expect(postService.deleteComment(1338, 1337)).rejects.toThrow('Http Exception');
	});

	it('Create post, comment, and get post id for comment', async () => {
		const authService = app.get(AuthService);
		const ownUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const postService = app.get(PostService);

		const postContent = faker.lorem.paragraph();
		const post = await postService.createPost(ownUser.id, {
			content: postContent,
			contentType: 'TEXT',
		});

		const commentContent = faker.lorem.paragraph();
		const comment = await postService.createComment(ownUser.id, {
			postId: post.id,
			content: commentContent,
		});

		const posts = await postService.getPosts();

		expect(posts[0].content).toBe(postContent);
		expect(posts[0].comments[0].content).toBe(commentContent);

		const retrievedPost = await postService.getPostFromCommentId(comment.id);

		expect(retrievedPost?.id).toBe(post.id);
	});

	it('Create post, comment, reply, and update reply', async () => {
		const authService = app.get(AuthService);
		const ownUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const postService = app.get(PostService);

		const postContent = faker.lorem.paragraph();
		const post = await postService.createPost(ownUser.id, {
			content: postContent,
			contentType: 'TEXT',
		});

		const commentContent = faker.lorem.paragraph();
		const comment = await postService.createComment(ownUser.id, {
			postId: post.id,
			content: commentContent,
		});

		const replyContent = faker.lorem.paragraph();
		const reply = await postService.createReply(ownUser.id, {
			commentId: comment.id,
			content: replyContent,
		});

		const posts = await postService.getPosts();

		expect(posts[0].content).toBe(postContent);
		expect(posts[0].comments[0].content).toBe(commentContent);
		expect(posts[0].comments[0].replies[0].content).toBe(replyContent);

		const updatedReply = faker.lorem.paragraph(1);
		await postService.updateReply(ownUser.id, reply.id, updatedReply);

		const postsAfterUpdate = await postService.getPosts();
		expect(postsAfterUpdate.length).toBe(1);
		expect(postsAfterUpdate[0].comments[0].replies[0].content).toBe(updatedReply);
	});

	it('Create post, comment, reply, and delete reply', async () => {
		const authService = app.get(AuthService);
		const ownUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const postService = app.get(PostService);

		const postContent = faker.lorem.paragraph();

		const post = await postService.createPost(ownUser.id, {
			content: postContent,
			contentType: 'TEXT',
		});

		const commentContent = faker.lorem.paragraph();

		const comment = await postService.createComment(ownUser.id, {
			postId: post.id,
			content: commentContent,
		});

		const replyContent = faker.lorem.paragraph();

		const reply = await postService.createReply(ownUser.id, {
			commentId: comment.id,
			content: replyContent,
		});

		const posts = await postService.getPosts();

		expect(posts[0].content).toBe(postContent);
		expect(posts[0].comments[0].content).toBe(commentContent);
		expect(posts[0].comments[0].replies[0].content).toBe(replyContent);

		await postService.deleteReply(ownUser.id, reply.id);

		const postsAfterUpdate = await postService.getPosts();
		expect(postsAfterUpdate.length).toBe(1);
		expect(postsAfterUpdate[0].comments[0].replies.length).toBe(0);
	});

	it('Check error when trying to delete a non existing reply', async () => {
		const postService = app.get(PostService);
		await expect(postService.deleteReply(1338, 1337)).rejects.toThrow('Http Exception');
	});

	it('Check if can create post, comment, and reply to the comment', async () => {
		const authService = app.get(AuthService);
		const ownUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const postService = app.get(PostService);

		const postContent = faker.lorem.paragraph();
		const post = await postService.createPost(ownUser.id, {
			content: postContent,
			contentType: 'TEXT',
		});

		const commentContent = faker.lorem.paragraph();
		const comment = await postService.createComment(ownUser.id, {
			postId: post.id,
			content: commentContent,
		});

		const replyContent = faker.lorem.paragraph();
		await postService.createReply(ownUser.id, {
			commentId: comment.id,
			content: replyContent,
		});

		const posts = await postService.getPosts();

		expect(posts[0].content).toBe(postContent);
		expect(posts[0].comments[0].content).toBe(commentContent);
		expect(posts[0].comments[0].replies[0].content).toBe(replyContent);

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

		const postContent = faker.lorem.paragraph();
		const post = await postService.createPost(ownUser.id, {
			content: postContent,
			contentType: 'TEXT',
		});

		const commentContent = faker.lorem.paragraph();
		const comment = await postService.createComment(ownUser.id, {
			postId: post.id,
			content: commentContent,
		});

		const replyContent = faker.lorem.paragraph();
		await postService.createReply(ownUser.id, {
			commentId: comment.id,
			content: replyContent,
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

		const postContent = faker.lorem.paragraph();
		const post = await postService.createPost(ownUser.id, {
			content: postContent,
			contentType: 'TEXT',
		});

		const commentContent = faker.lorem.paragraph();
		const comment = await postService.createComment(ownUser.id, {
			postId: post.id,
			content: commentContent,
		});

		const replyContent = faker.lorem.paragraph();
		await postService.createReply(ownUser.id, {
			commentId: comment.id,
			content: replyContent,
		});

		const secondReplyContent = faker.lorem.paragraph(2);
		await postService.createReply(ownUser.id, {
			commentId: comment.id,
			content: secondReplyContent,
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
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const postService = app.get(PostService);

		const firstPostContent = faker.lorem.paragraph();
		await postService.createPost(ownUser.id, {
			content: firstPostContent,
			contentType: 'TEXT',
		});

		// wait for 1 second to make sure the createdAt is different
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const secondPostContent = faker.lorem.paragraph(4);
		await postService.createPost(ownUser.id, {
			content: secondPostContent,
			contentType: 'TEXT',
		});

		const posts = await postService.getPosts();

		expect(posts[0].content).toBe(secondPostContent);
		expect(posts[1].content).toBe(firstPostContent);
	});

	it('Check order on comments', async () => {
		const authService = app.get(AuthService);
		const ownUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const postService = app.get(PostService);

		const postContent = faker.lorem.paragraph();
		const post = await postService.createPost(ownUser.id, {
			content: postContent,
			contentType: 'TEXT',
		});

		const firstCommentContent = faker.lorem.paragraph();
		await postService.createComment(ownUser.id, {
			postId: post.id,
			content: firstCommentContent,
		});

		// wait for 1 second to make sure the createdAt is different
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const secondCommentContent = faker.lorem.paragraph(4);
		await postService.createComment(ownUser.id, {
			postId: post.id,
			content: secondCommentContent,
		});

		const posts = await postService.getPosts();

		expect(posts[0].comments[0].content).toBe(firstCommentContent);
		expect(posts[0].comments[1].content).toBe(secondCommentContent);
	});

	it('Check order on replies', async () => {
		const authService = app.get(AuthService);
		const ownUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const postService = app.get(PostService);

		const postContent = faker.lorem.paragraph();
		const post = await postService.createPost(ownUser.id, {
			content: postContent,
			contentType: 'TEXT',
		});

		const commentContent = faker.lorem.paragraph();
		const comment = await postService.createComment(ownUser.id, {
			postId: post.id,
			content: commentContent,
		});

		const firstReplyContent = faker.lorem.paragraph();
		await postService.createReply(ownUser.id, {
			commentId: comment.id,
			content: firstReplyContent,
		});

		// wait for 1 second to make sure the createdAt is different
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const secondReplyContent = faker.lorem.paragraph(4);
		await postService.createReply(ownUser.id, {
			commentId: comment.id,
			content: secondReplyContent,
		});

		const posts = await postService.getPosts();

		expect(posts[0].comments[0].replies[0].content).toBe(firstReplyContent);
		expect(posts[0].comments[0].replies[1].content).toBe(secondReplyContent);
		expect(posts[0].comments[0].replies[1].author!.id).toBe(ownUser.id);
		expect(posts[0].comments[0].replies[1].author!.id).toBe(ownUser.id);
	});

	it('Check three posters order', async () => {
		const authService = app.get(AuthService);
		const firstUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const secondUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const thirdUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const postService = app.get(PostService);
		await postService.createPost(firstUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});
		// wait for 1 second to make sure the createdAt is different
		await new Promise((resolve) => setTimeout(resolve, 1000));
		await postService.createPost(secondUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});
		// wait for 1 second to make sure the createdAt is different
		await new Promise((resolve) => setTimeout(resolve, 1000));
		await postService.createPost(thirdUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});

		const posts = await postService.getPosts();
		expect(posts).toHaveLength(3);
		expect(posts[0].author!.id).toBe(thirdUser.id);
		expect(posts[1].author!.id).toBe(secondUser.id);
		expect(posts[2].author!.id).toBe(firstUser.id);
	});

	it('Check error when deleting a post that does not exist', async () => {
		const postService = app.get(PostService);
		await expect(postService.deletePost(1, 1)).rejects.toThrow(new HttpException({ error: 'Post not found' }, 404));
	});

	it('Like post', async () => {
		const authService = app.get(AuthService);
		const postService = app.get(PostService);
		const firstUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const secondUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const post = await postService.createPost(firstUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});

		await postService.likePost(secondUser.id, post.id);

		const resultPost = (await postService.getPosts())[0];
		const resultPostFirstUser = (await postService.getPosts(firstUser.id))[0];
		const resultPostSecondUser = (await postService.getPosts(secondUser.id))[0];

		const singlePostResponse = await postService.getPost(post.id);

		expect(resultPost.likes).toBe(1);
		expect(resultPost.likedBy).toBeUndefined();

		expect(singlePostResponse.likes).toBe(1);

		expect(resultPostFirstUser.likes).toBe(1);
		expect(resultPostFirstUser.likedBy).toHaveLength(0);

		expect(resultPostSecondUser.likes).toBe(1);
		expect(resultPostSecondUser.likedBy[0].id).toBe(secondUser.id);
	});

	it('Multiple likes post', async () => {
		const authService = app.get(AuthService);
		const postService = app.get(PostService);
		const firstUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const secondUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const post = await postService.createPost(firstUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});

		await postService.likePost(firstUser.id, post.id);
		await postService.likePost(secondUser.id, post.id);

		const resultPost = (await postService.getPosts())[0];
		const resultPostFirstUser = (await postService.getPosts(firstUser.id))[0];
		const resultPostSecondUser = (await postService.getPosts(secondUser.id))[0];

		expect(resultPost.likes).toBe(2);
		expect(resultPost.likedBy).toBeUndefined();
		expect(resultPostFirstUser.likes).toBe(2);
		expect(resultPostFirstUser.likedBy).toHaveLength(1);
		expect(resultPostSecondUser.likes).toBe(2);
		expect(resultPostSecondUser.likedBy).toHaveLength(1);
	});

	it('Like and undo like post', async () => {
		const authService = app.get(AuthService);
		const postService = app.get(PostService);
		const firstUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const post = await postService.createPost(firstUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});

		await postService.likePost(firstUser.id, post.id);
		await postService.likePost(firstUser.id, post.id);

		const resultPost = (await postService.getPosts())[0];
		const resultPostFirstUser = (await postService.getPosts(firstUser.id))[0];

		expect(resultPost.likes).toBe(0);
		expect(resultPost.likedBy).toBeUndefined();
		expect(resultPostFirstUser.likes).toBe(0);
		expect(resultPostFirstUser.likedBy).toHaveLength(0);
	});

	it('Find liked Posts', async () => {
		const authService = app.get(AuthService);
		const postService = app.get(PostService);
		const firstUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const firstPost = await postService.createPost(firstUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});
		const secondPost = await postService.createPost(firstUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});

		await postService.likePost(firstUser.id, firstPost.id);
		await postService.likePost(firstUser.id, secondPost.id);

		const likedPosts = await postService.findLikedPosts(firstUser.id);

		expect(likedPosts).toHaveLength(2);
	});

	// COMMENT

	it('Like comment', async () => {
		const authService = app.get(AuthService);
		const postService = app.get(PostService);
		const firstUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const secondUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const post = await postService.createPost(firstUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});
		const comment = await postService.createComment(firstUser.id, {
			content: faker.lorem.paragraph(),
			postId: post.id,
		});

		await postService.likeComment(secondUser.id, comment.id);

		const resultComment = (await postService.getComments(post.id))[0];

		expect(resultComment.likes).toBe(1);
	});

	it('Multiple likes comment', async () => {
		const authService = app.get(AuthService);
		const postService = app.get(PostService);
		const firstUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const secondUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const post = await postService.createPost(firstUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});
		const comment = await postService.createComment(firstUser.id, {
			content: faker.lorem.paragraph(),
			postId: post.id,
		});

		await postService.likeComment(firstUser.id, comment.id);
		await postService.likeComment(secondUser.id, comment.id);

		const resultComment = (await postService.getComments(post.id))[0];

		expect(resultComment.likes).toBe(2);
	});

	it('Like and undo like comment', async () => {
		const authService = app.get(AuthService);
		const postService = app.get(PostService);
		const firstUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const post = await postService.createPost(firstUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});
		const comment = await postService.createComment(firstUser.id, {
			content: faker.lorem.paragraph(),
			postId: post.id,
		});

		await postService.likeComment(firstUser.id, comment.id);
		await postService.likeComment(firstUser.id, comment.id);

		const resultComment = (await postService.getComments(post.id))[0];

		expect(resultComment.likes).toBe(0);
	});

	it('Find liked Comments', async () => {
		const authService = app.get(AuthService);
		const postService = app.get(PostService);
		const firstUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const post = await postService.createPost(firstUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});
		const firstComment = await postService.createComment(firstUser.id, {
			content: faker.lorem.paragraph(),
			postId: post.id,
		});
		const secondComment = await postService.createComment(firstUser.id, {
			content: faker.lorem.paragraph(),
			postId: post.id,
		});

		await postService.likeComment(firstUser.id, firstComment.id);
		await postService.likeComment(firstUser.id, secondComment.id);

		const likedPosts = await postService.findLikedComments(firstUser.id);

		expect(likedPosts).toHaveLength(2);
	});

	// Replies

	it('Like Reply', async () => {
		const authService = app.get(AuthService);
		const postService = app.get(PostService);
		const firstUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const post = await postService.createPost(firstUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});
		const comment = await postService.createComment(firstUser.id, {
			content: faker.lorem.paragraph(),
			postId: post.id,
		});
		const reply = await postService.createReply(firstUser.id, {
			content: faker.lorem.paragraph(),
			commentId: comment.id,
		});

		await postService.likeReply(firstUser.id, reply.id);

		const resultReply = (await postService.getReplies(comment.id))[0];

		expect(resultReply.likes).toBe(1);
	});

	it('Multiple likes Reply', async () => {
		const authService = app.get(AuthService);
		const postService = app.get(PostService);
		const firstUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const secondUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const post = await postService.createPost(firstUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});
		const comment = await postService.createComment(firstUser.id, {
			content: faker.lorem.paragraph(),
			postId: post.id,
		});
		const reply = await postService.createReply(firstUser.id, {
			content: faker.lorem.paragraph(),
			commentId: comment.id,
		});

		await postService.likeReply(firstUser.id, reply.id);
		await postService.likeReply(secondUser.id, reply.id);

		const resultReply = (await postService.getReplies(comment.id))[0];

		expect(resultReply.likes).toBe(2);
	});

	it('Like and undo like reply', async () => {
		const authService = app.get(AuthService);
		const postService = app.get(PostService);
		const firstUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const post = await postService.createPost(firstUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});
		const comment = await postService.createComment(firstUser.id, {
			content: faker.lorem.paragraph(),
			postId: post.id,
		});
		const reply = await postService.createReply(firstUser.id, {
			content: faker.lorem.paragraph(),
			commentId: comment.id,
		});

		await postService.likeReply(firstUser.id, reply.id);
		await postService.likeReply(firstUser.id, reply.id);

		const resultReply = (await postService.getReplies(comment.id))[0];

		expect(resultReply.likes).toBe(0);
	});

	it('Find liked Replies', async () => {
		const authService = app.get(AuthService);
		const postService = app.get(PostService);
		const firstUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const post = await postService.createPost(firstUser.id, {
			content: faker.lorem.paragraph(),
			contentType: 'TEXT',
		});
		const comment = await postService.createComment(firstUser.id, {
			content: faker.lorem.paragraph(),
			postId: post.id,
		});
		const firstReply = await postService.createReply(firstUser.id, {
			content: faker.lorem.paragraph(),
			commentId: comment.id,
		});
		const secondReply = await postService.createReply(firstUser.id, {
			content: faker.lorem.paragraph(),
			commentId: comment.id,
		});

		await postService.likeReply(firstUser.id, firstReply.id);
		await postService.likeReply(firstUser.id, secondReply.id);

		const likedReplies = await postService.findLikedReplies(firstUser.id);

		expect(likedReplies).toHaveLength(2);
	});

	it('Check error when trying to create a post with too many newlines', async () => {
		const postService = app.get(PostService);
		const authService = app.get(AuthService);

		const user = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		await expect(
			postService.createPost(user.id, {
				content: '\n1\n2\n3\n4',
				contentType: 'TEXT',
			}),
		).rejects.toThrow('Http Exception');
	});

	it('Create post, comment, and count comments.', async () => {
		const authService = app.get(AuthService);
		const ownUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const postService = app.get(PostService);

		const postContent = faker.lorem.paragraph();
		const post = await postService.createPost(ownUser.id, {
			content: postContent,
			contentType: 'TEXT',
		});

		const commentContent = faker.lorem.paragraph();
		await postService.createComment(ownUser.id, {
			postId: post.id,
			content: commentContent,
		});

		const posts = await postService.getPosts();

		expect(posts[0].numberOfComments).toBe(1);
	});

	it('Create post, comment, reply, and count comments.', async () => {
		const authService = app.get(AuthService);
		const ownUser = await authService.register({
			username: faker.internet.username(),
			password: faker.internet.password(),
		});
		const postService = app.get(PostService);

		const postContent = faker.lorem.paragraph();
		const post = await postService.createPost(ownUser.id, {
			content: postContent,
			contentType: 'TEXT',
		});

		const commentContent = faker.lorem.paragraph();
		const comment = await postService.createComment(ownUser.id, {
			postId: post.id,
			content: commentContent,
		});
		const replyContent = faker.lorem.paragraph();
		await postService.createReply(ownUser.id, {
			commentId: comment.id,
			content: replyContent,
		});

		const posts = await postService.getPosts();

		expect(posts[0].numberOfComments).toBe(2);
	});
});
