import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway {
  @WebSocketServer() wss: Server;

  @SubscribeMessage('identity')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }

  sendToAll(data: any) {
    this.wss.emit('message', data);
  }
}
