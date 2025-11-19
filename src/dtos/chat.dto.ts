import { ApiProperty } from '@nestjs/swagger';
import { ContentType, ContentTypeValues } from '../chat/chat.entity';
import { UserResponseDTO } from './user.dto';

export class CreateMessageDTO {
	@ApiProperty({
		description: 'The id of the conversation the message should be sent to',
	})
	conversationId: number;

	@ApiProperty({ description: 'The content of the message' })
	content: string;

	@ApiProperty({ enum: ContentTypeValues, description: 'The type of content' })
	contentType: ContentType;
}

export class GetMessagesDTO {
	@ApiProperty({
		description: 'The id of the conversation to get messages from',
	})
	conversationId: number;
	@ApiProperty({
		required: false,
		description:
			'To reduce the amount of data fetched the client can send the id of the last received message and only get messages that are newer than that',
	})
	lastMessage?: number;
}

export class MarkMessageAsReadDTO {
	@ApiProperty({ description: 'The id of the message to mark as read' })
	messageId: number;
}

export class MessageResponseDTO {
	@ApiProperty({ description: 'The id of the message' })
	id: number;

	@ApiProperty({
		description: 'The creation date of a message',
	})
	createdAt: Date;

	@ApiProperty({ description: 'The date of the last update of a message' })
	updatedAt: Date;

	@ApiProperty({ description: 'The content of the message' })
	content: string;

	@ApiProperty({ enum: ContentTypeValues, description: 'The type of content' })
	contentType: ContentType;

	@ApiProperty({ description: 'The author of the message' })
	author: UserResponseDTO;

	@ApiProperty({
		type: UserResponseDTO,
		isArray: true,
		description: 'The users that have read the message',
	})
	readBy: UserResponseDTO[];
}

export class ConversationResponseDTO {
	@ApiProperty({ description: 'The id of the conversation' })
	id: number;

	@ApiProperty({ description: 'The creation date of the conversation' })
	createdAt: Date;

	@ApiProperty({
		description: 'The date of the last update of the conversation',
	})
	updatedAt: Date;

	@ApiProperty({
		required: false,
		description: 'The title of the conversation',
	})
	title?: string;

	@ApiProperty({
		type: UserResponseDTO,
		isArray: true,
		description: 'The participants of the conversation',
	})
	participants: UserResponseDTO[];

	@ApiProperty({
		type: MessageResponseDTO,
		isArray: true,
		description: 'The messages belonging to the conversation',
	})
	messages: MessageResponseDTO[];

	@ApiProperty({
		type: MessageResponseDTO,
		nullable: true,
		description: 'The last message that was sent within a conversation',
	})
	lastMessage: MessageResponseDTO | null;
}

export class NumberOfUnreadMessagesResponseDTO {
	@ApiProperty({
		description: 'The number of unread messages for the authenticated user',
	})
	count: number;
}

export class MessagesCountResponseDTO {
	@ApiProperty({
		description: 'The total number of messages sent by the authenticated user',
	})
	count: number;
}

export class HasUnreadMessagesResponseDTO {
	@ApiProperty({
		description: 'Whether the authenticated user has unread messages',
	})
	hasUnreadMessages: boolean;
}

export class SetConversationTitleRequestDTO {
	@ApiProperty({ description: 'The id of the conversation' })
	conversationId: number;

	@ApiProperty({ description: 'The title to set for the conversation' })
	title: string;
}
