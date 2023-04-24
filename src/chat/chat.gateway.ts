import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class ChatGateway
  implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket>
{
  constructor(private jwtService: JwtService) {}

  @WebSocketServer() wss: Server;

  clientMap = new Map<number, Socket>();

  async handleConnection(
    client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
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
}
