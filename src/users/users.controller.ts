import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserResponseDTO } from 'src/dtos/user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: [UserResponseDTO] })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(@Request() req): Promise<User[]> {
    return await this.usersService.findAllWithoutSelf(req.user.userId);
  }
}
