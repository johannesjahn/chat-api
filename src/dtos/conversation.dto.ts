import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationRequestDTO {
  @ApiProperty({ type: 'array', items: { type: 'number' } })
  partnerIds: number[];
}
