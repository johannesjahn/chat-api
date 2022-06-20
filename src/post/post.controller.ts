import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import {
  CommentMapper,
  PostMapper,
  ReplyMapper,
} from 'src/post/post.mapper';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CommentResponseDTO,
  CreateCommentDTO,
  CreatePostDTO,
  CreateReplyDTO,
  DeleteCommentDTO,
  DeletePostDTO,
  DeleteReplyDTO,
  GetCommentsDTO,
  GetRepliesDTO,
  PostResponseDTO,
  ReplyResponseDTO,
  UpdateCommentDTO,
  UpdatePostDTO,
  UpdateReplyDTO,
} from '../dtos/post.dto';
import { PostService } from './post.service';

@ApiTags('post')
@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: PostResponseDTO })
  @Post('/')
  async createPost(@Request() req, @Body() body: CreatePostDTO) {
    const result = await this.postService.createPost(req.user.userId, body);
    const mapper = new PostMapper();

    const dto = mapper.convert(result);
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
    return this.postService.deletePost(req.user.userId, body.id);
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: PostResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Put('/')
  async updatePost(@Request() req, @Body() body: UpdatePostDTO) {
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
    const result = await this.postService.createComment(req.user.userId, body);
    const mapper = new CommentMapper();

    const dto = mapper.convert(result);
    return dto;
  }

  @Get('/comment')
  @ApiCreatedResponse({ type: CommentResponseDTO, isArray: true })
  async getComments(@Body() body: GetCommentsDTO) {
    const result = await this.postService.getComments(body.postId);
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
  @UseGuards(JwtAuthGuard)
  @Post('/reply')
  async createReply(@Request() req, @Body() body: CreateReplyDTO) {
    const result = await this.postService.createReply(req.user.userId, body);
    const mapper = new ReplyMapper();

    const dto = mapper.convert(result);
    return dto;
  }

  @ApiCreatedResponse({ type: ReplyResponseDTO, isArray: true })
  @Get('/reply')
  async getReplies(@Body() body: GetRepliesDTO) {
    const result = await this.postService.getReplies(body.commentId);
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
