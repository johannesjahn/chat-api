import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationRequestDTO {
	@ApiProperty({
		type: Number,
		isArray: true,
		description: "The partner ids of a conversation (Can't be empty or contain self)",
	})
	partnerIds: number[];
}

export class MarkConversationAsReadDTO {
	@ApiProperty({ description: 'The id of the conversation to mark as read' })
	conversationId: number;
}
