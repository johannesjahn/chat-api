import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationRequestDTO {
  @ApiProperty({ type: Number, isArray: true })
  partnerIds: number[];
}
