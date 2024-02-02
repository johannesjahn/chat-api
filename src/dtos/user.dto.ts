import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDTO {
	@ApiProperty({ description: 'The unique id of a user' })
	id: number;
	@ApiProperty({ description: 'The username of a user' })
	username: string;
	@ApiProperty({ description: 'The avatar hash of a user', nullable: true })
	avatarHash: string;
}
