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
  @ApiOperation({ summary: 'Send a message to a conversation' })
  @Post('/send-message')
  async sendMessage(@Request() req, @Body() body: CreateMessageDTO) {
    if (body.contentType !== 'TEXT' && body.contentType !== 'IMAGE_URL') {
      throw new HttpException('Invalid content type', 400);
    }
    if (body.contentType === 'IMAGE_URL' && !body.content.startsWith('http')) {
      throw new HttpException('Invalid image url', 400);
    }
    if (body.contentType === 'TEXT' && !body.content) {
      throw new HttpException('Message content is invalid', 400);
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
    summary: 'Endpoint to get messages relevant for the authenticated user',
  })
  @ApiCreatedResponse({
    type: ConversationResponseDTO,
    description: 'Fetches the messages for a given conversation.',
  })
  @Post('/get-messages')
  async getMessages(@Request() req, @Body() body: GetMessagesDTO) {
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
  @ApiCreatedResponse({ type: ConversationResponseDTO })
  async createConversation(
    @Request() req,
    @Body() body: CreateConversationRequestDTO,
  ) {
    const result = await this.chatService.createOne(req.user.userId, body);

    const mapper = new ConversationMapper();
    const dto = mapper.convert(result);
    return dto;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: [ConversationResponseDTO] })
  @Get('/get-conversations')
  async getConversations(@Request() req) {
    const result = await this.chatService.getConversationListForUser(
      req.user.userId,
    );
    const mapper = new ConversationMapper();
    const dtos = result.map((v) => mapper.convert(v));

    return dtos;
  }
}
