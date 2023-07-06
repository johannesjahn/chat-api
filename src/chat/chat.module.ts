import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { ChatController } from './chat.controller';
import { Conversation, Message } from './chat.entity';
import { ChatService } from './chat.service';
import { PostModule } from 'src/post/post.module';
import { ChatGateway } from './chat.gateway';
import { jwtModule } from 'src/auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		TypeOrmModule.forFeature([Conversation]),
		TypeOrmModule.forFeature([Message]),
		PostModule,
		jwtModule,
	],
	controllers: [ChatController],
	providers: [ChatService, ChatGateway],
	exports: [ChatGateway],
})
export class ChatModule {}
