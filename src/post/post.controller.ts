import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CommentMapper, PostMapper, ReplyMapper } from 'src/post/post.mapper';
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

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(
    private postService: PostService,
    private postGateway: PostGateway,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: PostResponseDTO })
  @Post('/')
  async createPost(@Request() req, @Body() body: CreatePostDTO) {
    const result = await this.postService.createPost(req.user.userId, body);
    const mapper = new PostMapper();

    const dto = mapper.convert(result);
    this.postGateway.sendPostToAll(dto);
    return dto;
  }

  @Get('/')
  @ApiCreatedResponse({ type: PostResponseDTO, isArray: true })
  async getPosts() {
    const result = await this.postService.getPosts();
    const mapper = new PostMapper();

    const dtos = result.map((p) => mapper.convert(p));
    return dtos;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/')
  async deletePost(@Request() req, @Body() body: DeletePostDTO) {
    if (!body.id) {
      throw new HttpException('Id is required', 400);
    }
    return this.postService.deletePost(req.user.userId, body.id);
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: PostResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Put('/')
  async updatePost(@Request() req, @Body() body: UpdatePostDTO) {
    if (!body.content || body.content.length == 0) {
      throw new HttpException('Content is required', 400);
    }

    const result = await this.postService.updatePost(req.user.userId, body);
    const mapper = new PostMapper();

    const dto = mapper.convert(result);
    return dto;
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CommentResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Post('/comment')
  async createComment(@Request() req, @Body() body: CreateCommentDTO) {
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
  @ApiCreatedResponse({ type: CommentResponseDTO, isArray: true })
  async getComments(@Param('postId') postId: number) {
    const result = await this.postService.getComments(postId);
    const mapper = new CommentMapper();

    const dtos = result.map((c) => mapper.convert(c));
    return dtos;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/comment')
  async deleteComment(@Request() req, @Body() body: DeleteCommentDTO) {
    return this.postService.deleteComment(req.user.userId, body.commentId);
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CommentResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Put('/comment')
  async updateComment(@Request() req, @Body() body: UpdateCommentDTO) {
    if (!body.content || body.content.length == 0) {
      throw new HttpException('Content is required', 400);
    }

    const result = await this.postService.updateComment(
      req.user.userId,
      body.commentId,
      body.content,
    );
    const mapper = new CommentMapper();

    const dto = mapper.convert(result);
    return dto;
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ReplyResponseDTO })
  @ApiOperation({ summary: 'Create reply with the authenticated user' })
  @UseGuards(JwtAuthGuard)
  @Post('/reply')
  async createReply(@Request() req, @Body() body: CreateReplyDTO) {
    if (!body.content || body.content.length == 0) {
      throw new HttpException('Content is required', 400);
    }

    const result = await this.postService.createReply(req.user.userId, body);
    const mapper = new ReplyMapper();

    const dto = mapper.convert(result);
    this.postGateway.sendReplyToAll(body.commentId);
    return dto;
  }

  @ApiCreatedResponse({ type: ReplyResponseDTO, isArray: true })
  @Get('/reply/:commentId')
  async getReplies(@Param('commentId') commentId: number) {
    const result = await this.postService.getReplies(commentId);
    const mapper = new ReplyMapper();

    const dtos = result.map((r) => mapper.convert(r));
    return dtos;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/reply')
  async deleteReply(@Request() req, @Body() body: DeleteReplyDTO) {
    return this.postService.deleteReply(req.user.userId, body.replyId);
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ReplyResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Put('/reply')
  async updateReply(@Request() req, @Body() body: UpdateReplyDTO) {
    if (!body.content || body.content.length == 0) {
      throw new HttpException('Content is required', 400);
    }

    const result = await this.postService.updateReply(
      req.user.userId,
      body.replyId,
      body.content,
    );
    const mapper = new ReplyMapper();

    const dto = mapper.convert(result);
    return dto;
  }
}
