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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateCommentDTO,
  CreatePostDTO,
  CreateReplyDTO,
  DeleteCommentDTO,
  DeletePostDTO,
  DeleteReplyDTO,
  GetCommentsDTO,
  GetRepliesDTO,
  PostResponseDTO,
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
    return this.postService.createPost(req.user.userId, body);
  }

  @Get('/')
  async getPosts() {
    return this.postService.getPosts();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/')
  async deletePost(@Request() req, @Body() body: DeletePostDTO) {
    return this.postService.deletePost(req.user.userId, body.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/')
  async updatePost(@Request() req, @Body() body: UpdatePostDTO) {
    return this.postService.updatePost(req.user.userId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/comment')
  async createComment(@Request() req, @Body() body: CreateCommentDTO) {
    return this.postService.createComment(req.user.userId, body);
  }

  @Get('/comment')
  async getComments(@Body() body: GetCommentsDTO) {
    return await this.postService.getComments(body.postId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/comment')
  async deleteComment(@Request() req, @Body() body: DeleteCommentDTO) {
    return this.postService.deleteComment(req.user.userId, body.commentId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/comment')
  async updateComment(@Request() req, @Body() body: UpdateCommentDTO) {
    return this.postService.updateComment(
      req.user.userId,
      body.commentId,
      body.content,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/reply')
  async createReply(@Request() req, @Body() body: CreateReplyDTO) {
    return this.postService.createReply(req.user.userId, body);
  }

  @Get('/reply')
  async getReplies(@Body() body: GetRepliesDTO) {
    return await this.postService.getReplies(body.commentId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/reply')
  async deleteReply(@Request() req, @Body() body: DeleteReplyDTO) {
    return this.postService.deleteReply(req.user.userId, body.replyId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/reply')
  async updateReply(@Request() req, @Body() body: UpdateReplyDTO) {
    return this.postService.updateReply(
      req.user.userId,
      body.replyId,
      body.content,
    );
  }
}
