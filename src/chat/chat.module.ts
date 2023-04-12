import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { ChatController } from './chat.controller';
import { Conversation, Message } from './chat.entity';
import { ChatService } from './chat.service';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Conversation]),
    TypeOrmModule.forFeature([Message]),
    PostModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
