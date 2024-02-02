import { UserResponseDTO } from '../dtos/user.dto';
import { User } from './user.entity';
import { Converter, Mapper } from 'typevert';

@Mapper({ sourceType: User, targetType: UserResponseDTO }, [
	{ source: 'id', target: 'id' },
	{ source: 'username', target: 'username' },
	{ source: 'avatarHash', target: 'avatarHash' },
])
export class UserMapper extends Converter<User, UserResponseDTO> {}
