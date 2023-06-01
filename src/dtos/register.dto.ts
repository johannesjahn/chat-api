import { ApiProperty } from '@nestjs/swagger';

export class RegisterDTO {
  @ApiProperty({ description: 'The username to be registered user' })
  username: string;
  @ApiProperty({ description: 'The password to be registered user' })
  password: string;
}
