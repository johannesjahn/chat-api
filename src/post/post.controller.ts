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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  CreateCommentDTO,
  CreatePostDTO,
  CreateReplyDTO,
  DeletePostDTO,
  UpdatePostDTO,
} from 'src/dtos/post.dto';
import { PostService } from './post.service';

@ApiTags('post')
@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/reply')
  async createReply(@Request() req, @Body() body: CreateReplyDTO) {
    return this.postService.createReply(req.user.userId, body);
  }
}
