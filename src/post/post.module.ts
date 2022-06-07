import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { Comment, Post, Reply } from './post.entity';
import { PostService } from './post.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment, Reply])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
