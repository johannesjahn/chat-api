import { UserResponseDTO } from '../dtos/user.dto';
import { User } from '../users/user.entity';
import { Converter, Mapper } from 'typevert';

@Mapper({ sourceType: User, targetType: UserResponseDTO }, [
  { source: 'id', target: 'id' },
  { source: 'username', target: 'username' },
])
export class UserMapper extends Converter<User, UserResponseDTO> {}
