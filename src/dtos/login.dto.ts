import { ApiProperty } from '@nestjs/swagger';

export class LoginDTO {
  @ApiProperty({ description: 'The username of a user' })
  username: string;
  @ApiProperty({ description: 'The password of a user' })
  password: string;
}

export class LoginResponseDTO {
  @ApiProperty({ description: 'The JWT access token of a user' })
  access_token: string;
}
