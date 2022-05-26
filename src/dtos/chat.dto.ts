import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDTO } from './user.dto';

export class CreateMessageDTO {
  @ApiProperty()
  conversationId: number;

  @ApiProperty()
  content: string;
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
  author: UserResponseDTO;
}

export class ConversationResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [UserResponseDTO] })
  participants: UserResponseDTO[];

  @ApiProperty({ type: [MessageResponseDTO] })
  messages: MessageResponseDTO[];
}
