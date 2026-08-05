import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { LoginRequestDto } from './dtos/request/login-request.dto';
import { AuthTokenDto } from './dtos/response/auth-token.dto';
import { LoginService } from '../services/login.service';
import { DateTime } from 'luxon';

@ApiTags('Autenticação')
@Public()
@Controller()
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  async handle(
    @Body() body: LoginRequestDto,
  ): Promise<ResponseInterface<AuthTokenDto>> {
    const result = await this.loginService.execute(
      body.email,
      body.senha,
      body.plataforma,
    );
    const response = new AuthTokenDto(
      result.accessToken,
      result.refreshToken,
      DateTime.now().plus({ seconds: result.validade }),
    );
    return {
      response,
    };
  }
}
