import { ApiProperty } from '@nestjs/swagger';

export class RegisterDTO {
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
}
