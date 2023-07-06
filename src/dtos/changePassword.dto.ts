import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDTO {
	@ApiProperty({ description: 'The new password' })
	password: string;

	@ApiProperty({
		description: 'The new password again, to confirm it got typed in properly',
	})
	passwordConfirm: string;
}
