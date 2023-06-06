import { ApiProperty } from '@nestjs/swagger';

export class VersionDTO {
  @ApiProperty({ description: 'The version of the API' })
  version: string;
}
