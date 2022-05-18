import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  username: string;
}
