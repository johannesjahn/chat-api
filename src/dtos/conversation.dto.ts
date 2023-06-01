import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationRequestDTO {
  @ApiProperty({
    type: Number,
    isArray: true,
    description:
      "The partner ids of a conversation (Can't be empty or contain self)",
  })
  partnerIds: number[];
}
