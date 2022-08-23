import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { PostResponseDTO } from '../dtos/post.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PostGateway {
  @WebSocketServer() wss: Server;

  sendPostToAll(post: PostResponseDTO) {
    this.wss.emit('post', post);
  }

  sendCommentToAll(postId: number) {
    this.wss.emit('post/comment', postId);
  }
}
