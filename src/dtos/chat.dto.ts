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
