import { Body, Controller, Delete, Get, HttpException, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentMapper, PostMapper, ReplyMapper } from '../post/post.mapper';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
	CommentResponseDTO,
	CreateCommentDTO,
	CreatePostDTO,
	CreateReplyDTO,
	DeleteCommentDTO,
	DeletePostDTO,
	DeleteReplyDTO,
	PostResponseDTO,
	ReplyResponseDTO,
	UpdateCommentDTO,
	UpdatePostDTO,
	UpdateReplyDTO,
} from '../dtos/post.dto';
import { PostGateway } from './post.gateway';
import { PostService } from './post.service';
import { JwtOptionalAuthGuard } from '../auth/jwt-optional-auth.guard';

@ApiTags('Post')
@Controller('post')
export class PostController {
	constructor(
		private postService: PostService,
		private postGateway: PostGateway,
	) {}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ description: 'Create post with the authenticated user' })
	@ApiCreatedResponse({ type: PostResponseDTO })
	@Post('/')
	async createPost(@Request() req: any, @Body() body: CreatePostDTO) {
		const result = await this.postService.createPost(req.user.userId, body);
		const mapper = new PostMapper();

		const dto = mapper.convert(result);
		this.postGateway.sendPostToAll(dto);
		return dto;
	}

	@Get('/single/:postId')
	@ApiBearerAuth()
	@ApiOperation({ description: 'Get a post by id' })
	@UseGuards(JwtOptionalAuthGuard)
	@ApiCreatedResponse({ type: PostResponseDTO })
	async getPost(@Request() req: any, @Param('postId') postId: number) {
		let userId: number | undefined;
		if (req.user) {
			userId = req.user.userId;
		}
		const result = await this.postService.getPost(postId, userId);
		const mapper = new PostMapper();

		const dto = mapper.convert(result);
		return dto;
	}

	@Get('/')
	@ApiBearerAuth()
	@ApiOperation({ description: 'Get all posts' })
	@UseGuards(JwtOptionalAuthGuard)
	@ApiCreatedResponse({
		type: PostResponseDTO,
		isArray: true,
	})
	async getPosts(@Request() req: any) {
		let userId: number | undefined;
		if (req.user) {
			userId = req.user.userId;
		}
		const result = await this.postService.getPosts(userId);
		const mapper = new PostMapper();

		const dtos = result.map((p) => mapper.convert(p));
		return dtos;
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({
		description: 'Delete a post that belongs to the currently authenticated user',
	})
	@Delete('/')
	async deletePost(@Request() req: any, @Body() body: DeletePostDTO) {
		if (!body.id) {
			throw new HttpException({ error: 'Id is required' }, 400);
		}
		return this.postService.deletePost(req.user.userId, body.id);
	}

	@ApiBearerAuth()
	@ApiCreatedResponse({ type: PostResponseDTO })
	@ApiOperation({
		description: 'Update a post that belongs to the currently authenticated user',
	})
	@UseGuards(JwtAuthGuard)
	@Put('/')
	async updatePost(@Request() req: any, @Body() body: UpdatePostDTO) {
		if (!body.content || body.content.length == 0) {
			throw new HttpException({ error: 'Content is required' }, 400);
		}

		const result = await this.postService.updatePost(req.user.userId, body);
		const mapper = new PostMapper();

		const dto = mapper.convert(result);
		return dto;
	}

	@ApiBearerAuth()
	@ApiCreatedResponse({ type: CommentResponseDTO })
	@ApiOperation({ description: 'Create comment with the authenticated user' })
	@UseGuards(JwtAuthGuard)
	@Post('/comment')
	async createComment(@Request() req: any, @Body() body: CreateCommentDTO) {
		if (!body.content || body.content.length == 0) {
			throw new HttpException('Content is required', 400);
		}

		const result = await this.postService.createComment(req.user.userId, body);
		const mapper = new CommentMapper();

		const dto = mapper.convert(result);
		this.postGateway.sendCommentToAll(body.postId);
		return dto;
	}

	@Get('/comment/:postId')
	@ApiOperation({ description: 'Get comments of a post' })
	@ApiCreatedResponse({ type: CommentResponseDTO, isArray: true })
	async getComments(@Param('postId') postId: number) {
		const result = await this.postService.getComments(postId);
		const mapper = new CommentMapper();

		const dtos = result.map((c) => mapper.convert(c));
		return dtos;
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({
		description: 'Delete a comment that belongs to the currently authenticated user',
	})
	@Delete('/comment')
	async deleteComment(@Request() req: any, @Body() body: DeleteCommentDTO) {
		return this.postService.deleteComment(req.user.userId, body.commentId);
	}

	@ApiBearerAuth()
	@ApiCreatedResponse({ type: CommentResponseDTO })
	@ApiOperation({
		description: 'Update a comment that belongs to the currently authenticated user',
	})
	@UseGuards(JwtAuthGuard)
	@Put('/comment')
	async updateComment(@Request() req: any, @Body() body: UpdateCommentDTO) {
		if (!body.content || body.content.length == 0) {
			throw new HttpException({ error: 'Content is required' }, 400);
		}

		const result = await this.postService.updateComment(req.user.userId, body.commentId, body.content);
		const mapper = new CommentMapper();

		const dto = mapper.convert(result);
		return dto;
	}

	@ApiBearerAuth()
	@ApiCreatedResponse({ type: ReplyResponseDTO })
	@ApiOperation({ description: 'Create reply with the authenticated user' })
	@UseGuards(JwtAuthGuard)
	@Post('/reply')
	async createReply(@Request() req: any, @Body() body: CreateReplyDTO) {
		if (!body.content || body.content.length == 0) {
			throw new HttpException({ error: 'Content is required' }, 400);
		}

		const result = await this.postService.createReply(req.user.userId, body);
		const mapper = new ReplyMapper();

		const dto = mapper.convert(result);
		this.postGateway.sendReplyToAll(body.commentId);
		return dto;
	}

	@ApiCreatedResponse({ type: ReplyResponseDTO, isArray: true })
	@ApiOperation({ description: 'Get replies of a comment' })
	@Get('/reply/:commentId')
	async getReplies(@Param('commentId') commentId: number) {
		const result = await this.postService.getReplies(commentId);
		const mapper = new ReplyMapper();

		const dtos = result.map((r) => mapper.convert(r));
		return dtos;
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ description: 'Delete reply with the authenticated user' })
	@Delete('/reply')
	async deleteReply(@Request() req: any, @Body() body: DeleteReplyDTO) {
		return this.postService.deleteReply(req.user.userId, body.replyId);
	}

	@ApiBearerAuth()
	@ApiCreatedResponse({ type: ReplyResponseDTO })
	@ApiOperation({ description: 'Update reply with the authenticated user' })
	@UseGuards(JwtAuthGuard)
	@Put('/reply')
	async updateReply(@Request() req: any, @Body() body: UpdateReplyDTO) {
		if (!body.content || body.content.length == 0) {
			throw new HttpException({ error: 'Content is required' }, 400);
		}

		const result = await this.postService.updateReply(req.user.userId, body.replyId, body.content);
		const mapper = new ReplyMapper();

		const dto = mapper.convert(result);
		return dto;
	}

	@ApiBearerAuth()
	@ApiOperation({ description: 'Like or dislike a post' })
	@UseGuards(JwtAuthGuard)
	@Post(':postId/like')
	async likePost(@Request() req: any, @Param('postId') postId: number) {
		await this.postService.likePost(req.user.userId, postId);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ description: 'Like or dislike a comment' })
	@Post('/comment/:commentId/like')
	async likeComment(@Request() req: any, @Param('commentId') commentId: number) {
		await this.postService.likeComment(req.user.userId, commentId);
	}

	@ApiBearerAuth()
	@ApiOperation({ description: 'Like or dislike a reply' })
	@UseGuards(JwtAuthGuard)
	@Post('/reply/:replyId/like')
	async likeReply(@Request() req: any, @Param('replyId') replyId: number) {
		await this.postService.likeReply(req.user.userId, replyId);
	}

	@ApiBearerAuth()
	@ApiOperation({ description: 'Get posts liked by the authenticated user' })
	@ApiCreatedResponse({ type: PostResponseDTO, isArray: true })
	@UseGuards(JwtAuthGuard)
	@Get('/like')
	async getLikedPosts(@Request() req: any) {
		const result = await this.postService.findLikedPosts(req.user.userId);
		const mapper = new PostMapper();

		const dtos = result.map((p) => mapper.convert(p));
		return dtos;
	}
}
