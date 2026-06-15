import { Body, Controller, Post } from '@nestjs/common';
import { RefreshTokenRequestDto } from '../dtos/request/refresh-token-request.dto';
import { AuthTokenDto } from '../dtos/response/auth-token.dto';
import { ResponseInterface } from '@common/interfaces/response-interface';

@Controller()
export class RefreshTokenController {
  constructor() {}

  @Post('refresh')
  async handle(
    @Body() body: RefreshTokenRequestDto,
  ): Promise<ResponseInterface<AuthTokenDto>> {
    const response = new AuthTokenDto();
    return { response };
  }
}
