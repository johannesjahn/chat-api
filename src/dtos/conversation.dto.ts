import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationRequestDTO {
  @ApiProperty()
  partnerIds: number[];
}
