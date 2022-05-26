import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  ConversationResponseDTO,
  CreateMessageDTO,
  GetMessagesDTO,
  MessageResponseDTO,
} from 'src/dtos/chat.dto';
import { CreateConversationRequestDTO } from 'src/dtos/conversation.dto';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: MessageResponseDTO })
  @Post('/send-message')
  async sendMessage(@Request() req, @Body() body: CreateMessageDTO) {
    const result = await this.chatService.sendMessage(
      req.user.userId,
      body.conversationId,
      body.content,
    );
    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/create-conversation')
  @ApiCreatedResponse({ type: ConversationResponseDTO })
  async createConversation(
    @Request() req,
    @Body() body: CreateConversationRequestDTO,
  ) {
    return await this.chatService.createOne(req.user.userId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: [ConversationResponseDTO] })
  @Get('/get-conversations')
  async getConversations(@Request() req) {
    const result = await this.chatService.getConversationListForUser(
      req.user.userId,
    );
    return result;
  }
}
