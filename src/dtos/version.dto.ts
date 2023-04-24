import { ApiProperty } from '@nestjs/swagger';

export class VersionDTO {
  @ApiProperty()
  version: string;
}
