import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { UserMapper } from '../mappers/user.mapper';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserResponseDTO } from '../dtos/user.dto';
import { UsersService } from './users.service';

@ApiTags('User')
@ApiCreatedResponse({ type: [UserResponseDTO] })
@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: [UserResponseDTO] })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(@Request() req) {
    const result = await this.usersService.findAllWithoutSelf(req.user.userId);
    const mapper = new UserMapper();

    const dtos = result.map((u) => mapper.convert(u));
    return dtos;
  }
}
