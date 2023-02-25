import { Controller, Post, Body } from '@nestjs/common';

import { AuthService } from './auth.service';
//import { UsersService } from 'src/users/users.service';
//import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, //private readonly usersService: UsersService,
  ) {}

  /*@Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }*/

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
}
