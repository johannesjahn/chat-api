import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtModule } from 'src/auth/auth.module';
import { PostController } from './post.controller';
import { Comment, Post, Reply } from './post.entity';
import { PostGateway } from './post.gateway';
import { PostService } from './post.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment, Reply]), jwtModule],
  controllers: [PostController],
  providers: [PostService, PostGateway],
  exports: [PostGateway],
})
export class PostModule {}
