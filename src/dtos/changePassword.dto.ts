import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDTO {
  @ApiProperty()
  password: string;

  @ApiProperty()
  passwordConfirm: string;
}
