import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Repository } from 'typeorm';
import { PostResponseDTO } from '../dtos/post.dto';
import { Post } from './post.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class PostGateway
  implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket>
{
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  @WebSocketServer() wss: Server;
  clientMap = new Map<number, Socket>();

  async handleConnection(
    client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    ...args: any[]
  ) {
    const token = await this.jwtService.verifyAsync(
      client.handshake.auth.token,
    );
    this.clientMap.set(token.sub, client);
    console.log('connected');
  }
  async handleDisconnect(
    client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  ) {
    const token = await this.jwtService.verifyAsync(
      client.handshake.auth.token,
    );
    this.clientMap.delete(token.sub);
    console.log('disconnected');
  }

  updateMessagesForUsers(userIds: number[]) {
    for (const userId of userIds) {
      if (this.clientMap.has(userId)) {
        const client = this.clientMap.get(userId);
        client.emit('message', 'new message');
      }
    }
  }

  sendPostToAll(post: PostResponseDTO) {
    this.wss.emit('post', post);
  }

  sendCommentToAll(postId: number) {
    this.wss.emit('post/comment', postId);
  }

  sendReplyToAll(commentId: number) {
    this.wss.emit('post/comment/reply', commentId);
  }
}
