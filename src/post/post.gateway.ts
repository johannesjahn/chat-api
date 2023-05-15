import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { PostResponseDTO } from '../dtos/post.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class PostGateway {
  @WebSocketServer() wss: Server;

  /**
   *
   * @param post PostResponseDTO
   * Send post to all connected clients
   */
  sendPostToAll(post: PostResponseDTO) {
    this.wss.emit('post', post);
  }

  /**
   * @param postId id of the post to be notified about
   * Send comment to all connected clients
   */
  sendCommentToAll(postId: number) {
    this.wss.emit('post/comment', postId);
  }

  sendReplyToAll(commentId: number) {
    this.wss.emit('post/comment/reply', commentId);
  }
}
