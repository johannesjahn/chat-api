import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from 'src/chat/chat.entity';
import { UserResponseDTO } from './user.dto';

export class CreateMessageDTO {
  @ApiProperty()
  conversationId: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  contentType: ContentType;
}

export class GetMessagesDTO {
  @ApiProperty()
  conversationId: number;
  @ApiProperty({
    required: false,
    description:
      'To reduce the amount of data fetched the client can send the id of the last received message and only get messages that are newer than that',
  })
  lastMessage?: number;
}

export class MessageResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  content: string;

  @ApiProperty()
  contentType: ContentType;

  @ApiProperty()
  author: UserResponseDTO;
}

export class ConversationResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: UserResponseDTO, isArray: true })
  participants: UserResponseDTO[];

  @ApiProperty({ type: MessageResponseDTO, isArray: true })
  messages: MessageResponseDTO[];
}
