import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDTO, CreatePostDTO, CreateReplyDTO, UpdatePostDTO } from '../dtos/post.dto';
import { Comment, Post, Reply } from './post.entity';
import { User } from '../users/user.entity';

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(Post)
		private postRepository: Repository<Post>,
		@InjectRepository(Comment)
		private commentRepository: Repository<Comment>,
		@InjectRepository(Reply)
		private replyRepository: Repository<Reply>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	private checkPostContent(post: CreatePostDTO | UpdatePostDTO) {
		// Count line breaks in the content
		const lineBreaks = (post.content.match(/\n/g) || []).length;
		if (lineBreaks > 3) {
			throw new HttpException(
				{
					error: 'Post content cannot contain more than 3 line breaks',
				},
				400,
			);
		}
	}

	async createPost(userId: number, post: CreatePostDTO) {
		this.checkPostContent(post);
		const createdPost: Post = await this.postRepository.save({
			content: post.content,
			contentType: post.contentType,
			author: { id: userId },
		});

		delete createdPost.author;

		return createdPost;
	}

	async getPost(postId: number, userId?: number) {
		let query = this.postRepository
			.createQueryBuilder('post')
			.leftJoinAndSelect('post.author', 'author')
			.leftJoinAndSelect('post.comments', 'comments')
			.leftJoinAndSelect('comments.author', 'commentAuthor')
			.leftJoinAndSelect('comments.replies', 'replies')
			.leftJoinAndSelect('replies.author', 'replyAuthor')
			.where('post.id = :postId', { postId });

		if (userId) {
			query = query.leftJoinAndSelect('post.likedBy', 'likedBy', 'likedBy.id = :userId', { userId });
		}

		const result = await query.getOne();
		if (!result) throw new HttpException({ error: 'Post not found' }, 404);
		return result;
	}

	async getPosts(userId?: number) {
		let query = this.postRepository
			.createQueryBuilder('post')
			.leftJoinAndSelect('post.author', 'author')
			.leftJoinAndSelect('post.comments', 'comments')
			.leftJoinAndSelect('comments.author', 'commentAuthor')
			.leftJoinAndSelect('comments.replies', 'replies')
			.leftJoinAndSelect('replies.author', 'replyAuthor');

		if (userId) {
			query = query.leftJoinAndSelect('post.likedBy', 'likedBy', 'likedBy.id = :userId', { userId });
		}

		query = query.orderBy('post.createdAt', 'DESC');

		const result = await query.getMany();
		return result;
	}

	async deletePost(userId: number, postId: number) {
		const result = await this.postRepository.delete({
			id: postId,
			author: { id: userId },
		});

		if (result.affected === 0) throw new HttpException({ error: 'Post not found' }, 404);
		return { success: 'Post deleted' };
	}

	async updatePost(userId: number, postDTO: UpdatePostDTO) {
		this.checkPostContent(postDTO);
		const post = await this.postRepository.findOne({
			where: { id: postDTO.id, author: { id: userId } },
		});
		delete post?.numberOfComments;

		if (!post) throw new HttpException({ error: 'Post not found' }, 404);
		post.content = postDTO.content;
		post.contentType = postDTO.contentType;

		await this.postRepository.update(postDTO.id, post);

		return post;
	}

	async createComment(userId: number, createCommentDTO: CreateCommentDTO) {
		const result: Comment = await this.commentRepository.save({
			author: { id: userId },
			post: { id: createCommentDTO.postId },
			content: createCommentDTO.content,
		});

		delete result.author;

		return result;
	}

	async getComments(postId: number) {
		const result = await this.commentRepository.find({
			where: { post: { id: postId } },
			order: { createdAt: 'ASC' },
			relations: ['author', 'likedBy', 'replies', 'replies.author'],
		});
		return result;
	}

	async updateComment(userId: number, commentId: number, content: string) {
		const comment = await this.commentRepository.findOne({
			where: { id: commentId, author: { id: userId } },
		});
		if (!comment) throw new HttpException({ error: 'Comment not found' }, 404);
		comment.content = content;

		await this.commentRepository.update(commentId, comment);

		return comment;
	}

	async deleteComment(userId: number, commentId: number) {
		const result = await this.commentRepository.delete({
			id: commentId,
			author: { id: userId },
		});
		if (result.affected === 0) throw new HttpException({ error: 'Comment not found' }, 404);
		return { success: 'Comment deleted' };
	}

	async createReply(userId: number, createReplyDTO: CreateReplyDTO) {
		const result: Reply = await this.replyRepository.save({
			author: { id: userId },
			comment: { id: createReplyDTO.commentId },
			content: createReplyDTO.content,
		});

		delete result.author;

		return result;
	}

	async getPostFromCommentId(commentId: number) {
		const result = await this.commentRepository.findOne({
			where: { id: commentId },
			relations: ['post'],
		});
		return result?.post;
	}

	async getReplies(commentId: number) {
		const result = await this.replyRepository.find({
			where: { comment: { id: commentId } },
			order: { createdAt: 'ASC' },
			relations: ['author', 'likedBy'],
		});
		return result;
	}

	async updateReply(userId: number, replyId: number, content: string) {
		const reply = await this.replyRepository.findOne({
			where: { id: replyId, author: { id: userId } },
		});
		if (!reply) throw new HttpException({ error: 'Reply not found' }, 404);
		reply.content = content;

		await this.replyRepository.update(replyId, reply);

		return reply;
	}

	async deleteReply(userId: number, replyId: number) {
		const result = await this.replyRepository.delete({
			id: replyId,
			author: { id: userId },
		});
		if (result.affected === 0) throw new HttpException({ error: 'Reply not found' }, 404);
		return { success: 'Reply deleted' };
	}

	async likePost(userId: number, postId: number) {
		const post = await this.postRepository.findOne({
			where: { id: postId },
			relations: ['likedBy'],
		});

		if (post == null) {
			throw new HttpException({ error: 'Post not found' }, 404);
		}

		const likedUser = post.likedBy.findIndex((u) => u.id == userId);

		if (likedUser != -1) {
			post.likes -= 1;
			post.likedBy = post.likedBy.filter((u) => u.id != userId);
		} else {
			const user = await this.userRepository.findOne({
				where: { id: userId },
			});
			post.likes += 1;
			post.likedBy.push(user!);
		}

		await this.postRepository.save(post);
	}

	async findLikedPosts(userId: number) {
		const result = await this.postRepository.find({
			where: {
				likedBy: { id: userId },
			},
		});
		return result;
	}

	async likeComment(userId: number, commentId: number) {
		const comment = await this.commentRepository.findOne({
			where: { id: commentId },
			relations: ['likedBy'],
		});

		if (comment == null) {
			throw new HttpException({ error: 'Comment not found' }, 404);
		}

		const likedUser = comment.likedBy.findIndex((u) => u.id == userId);

		if (likedUser != -1) {
			comment.likes -= 1;
			comment.likedBy = comment.likedBy.filter((u) => u.id != userId);
		} else {
			const user = await this.userRepository.findOne({
				where: { id: userId },
			});
			comment.likes += 1;
			comment.likedBy.push(user!);
		}

		await this.commentRepository.save(comment);
	}

	async findLikedComments(userId: number) {
		const result = await this.commentRepository.find({
			where: {
				likedBy: { id: userId },
			},
		});
		return result;
	}

	async likeReply(userId: number, replyId: number) {
		const reply = await this.replyRepository.findOne({
			where: { id: replyId },
			relations: ['likedBy'],
		});

		if (reply == null) {
			throw new HttpException({ error: 'Reply not found' }, 404);
		}

		const likedUser = reply.likedBy.findIndex((u) => u.id == userId);

		if (likedUser != -1) {
			reply.likes -= 1;
			reply.likedBy = reply.likedBy.filter((u) => u.id != userId);
		} else {
			const user = await this.userRepository.findOne({
				where: { id: userId },
			});
			reply.likes += 1;
			reply.likedBy.push(user!);
		}

		await this.replyRepository.save(reply);
	}

	async findLikedReplies(userId: number) {
		const result = await this.replyRepository.find({
			where: {
				likedBy: { id: userId },
			},
		});
		return result;
	}
}
