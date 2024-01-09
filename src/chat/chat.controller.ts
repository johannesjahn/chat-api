import {
	Body,
	Controller,
	Get,
	HttpException,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { ConversationMapper, MessageMapper } from 'src/chat/chat.mapper';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
	ConversationResponseDTO,
	CreateMessageDTO,
	GetMessagesDTO,
	MessageResponseDTO,
} from '../dtos/chat.dto';
import { CreateConversationRequestDTO } from '../dtos/conversation.dto';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
	constructor(private chatService: ChatService) {}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiCreatedResponse({ type: MessageResponseDTO })
	@ApiOperation({ description: 'Send a message to a conversation' })
	@Post('/send-message')
	async sendMessage(@Request() req: any, @Body() body: CreateMessageDTO) {
		if (body.contentType !== 'TEXT' && body.contentType !== 'IMAGE_URL') {
			throw new HttpException({ error: 'Invalid content type' }, 400);
		}
		if (body.contentType === 'IMAGE_URL' && !body.content.startsWith('http')) {
			throw new HttpException({ error: 'Invalid image url' }, 400);
		}
		if (body.contentType === 'TEXT' && !body.content) {
			throw new HttpException({ error: 'Message content is invalid' }, 400);
		}

		const result = await this.chatService.sendMessage(
			req.user.userId,
			body.conversationId,
			body.content,
			body.contentType,
		);

		const mapper = new MessageMapper();
		const dto = mapper.convert(result);
		return dto;
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({
		description: 'Endpoint to get messages relevant for the authenticated user',
	})
	@ApiCreatedResponse({
		type: ConversationResponseDTO,
		description: 'Fetches the messages for a given conversation.',
		status: 200,
	})
	@ApiOperation({ description: 'Get messages for a conversation' })
	@Post('/get-messages')
	async getMessages(@Request() req: any, @Body() body: GetMessagesDTO) {
		const result = await this.chatService.getMessages(
			req.user.userId,
			body.conversationId,
			body.lastMessage,
		);
		const mapper = new ConversationMapper();
		const dto = mapper.convert(result);
		return dto;
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post('/create-conversation')
	@ApiOperation({
		description:
			'Endpoint to create a new conversation with two or more participants (authenticated user is automatically added to the conversation)',
	})
	@ApiCreatedResponse({ type: ConversationResponseDTO })
	async createConversation(
		@Request() req: any,
		@Body() body: CreateConversationRequestDTO,
	) {
		const result = await this.chatService.createConversation(
			req.user.userId,
			body,
		);

		const mapper = new ConversationMapper();
		const dto = mapper.convert(result);
		return dto;
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiCreatedResponse({ type: [ConversationResponseDTO] })
	@ApiOperation({
		description: 'Endpoint to get all conversations for the authenticated user',
	})
	@Get('/get-conversations')
	async getConversations(@Request() req: any) {
		const result = await this.chatService.getConversationListForUser(
			req.user.userId,
		);
		const mapper = new ConversationMapper();
		const dtos = result.map((v) => mapper.convert(v));

		return dtos;
	}
}
