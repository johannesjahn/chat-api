import { ApiProperty } from '@nestjs/swagger';

export class DebugResponseDTO {
	@ApiProperty({ description: 'The message' })
	message: string;
}
