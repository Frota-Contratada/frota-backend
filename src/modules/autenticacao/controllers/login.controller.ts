import { Body, Controller, Post } from '@nestjs/common';
import { AuthTokenDto } from '../dtos/response/auth-token.dto';
import { LoginRequestDto } from '../dtos/request/login-request.dto';
import { ResponseInterface } from '@common/interfaces/response-interface';

@Controller()
export class LoginController {
  constructor() {}

  @Post('login')
  async handle(
    @Body() body: LoginRequestDto,
  ): Promise<ResponseInterface<AuthTokenDto>> {
    const response = new AuthTokenDto();
    return { response };
  }
}
