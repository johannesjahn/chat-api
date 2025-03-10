import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
@Injectable()
export class ChatGateway implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
	constructor(private jwtService: JwtService) {}

	@WebSocketServer() wss: Server;

	clientMap = new Map<number, Socket>();
	private logger = new Logger('Chat Gateway');

	async handleConnection(client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
		const token = await this.jwtService.verifyAsync(client.handshake.auth.token);
		this.clientMap.set(token.sub, client);
		this.logger.log('connected ws');
	}
	async handleDisconnect(client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
		const token = await this.jwtService.verifyAsync(client.handshake.auth.token);
		this.clientMap.delete(token.sub);
		this.logger.log('disconnected ws');
	}

	updateMessagesForUsers(userIds: number[], conversationId: number) {
		this.logger.log('Sending message to users for conversation', conversationId);
		for (const userId of userIds) {
			if (this.clientMap.has(userId)) {
				const client = this.clientMap.get(userId);
				client?.emit('message', {
					kind: 'message',
					conversationId: conversationId,
				});
			}
		}
	}

	updateConversationsForUsers(userIds: number[], conversationId: number) {
		this.logger.log('Sending conversation update to users', conversationId);
		for (const userId of userIds) {
			if (this.clientMap.has(userId)) {
				const client = this.clientMap.get(userId);
				client?.emit('conversation', {
					kind: 'conversation',
					conversationId: conversationId,
				});
			}
		}
	}
}
