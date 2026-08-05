import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { RefreshTokenRequestDto } from './dtos/request/refresh-token-request.dto';
import { AuthTokenDto } from './dtos/response/auth-token.dto';
import { RefreshTokenService } from '../services/refresh-token.service';
import { DateTime } from 'luxon';

@ApiTags('Autenticação')
@Public()
@Controller()
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Post('refresh')
  async handle(
    @Body() body: RefreshTokenRequestDto,
  ): Promise<ResponseInterface<AuthTokenDto>> {
    const result = await this.refreshTokenService.execute(body.refreshToken);
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
