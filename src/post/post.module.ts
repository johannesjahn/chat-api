import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { Comment, Post, Reply } from './post.entity';
import { PostGateway } from './post.gateway';
import { PostService } from './post.service';
import { User } from '../users/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Post, Comment, Reply, User])],
	controllers: [PostController],
	providers: [PostService, PostGateway],
	exports: [PostGateway],
})
export class PostModule {}
