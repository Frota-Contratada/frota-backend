import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { EnviarPinEmailRequestDto } from './dtos/request/enivar-pin-email-request.dto';
import { EnviarPinEmailService } from '../services/enivar-pin-email.service';

@ApiTags('Autenticação')
@Public()
@Controller()
export class EnviarPinEmailController {
  constructor(private readonly enviarPinEmailService: EnviarPinEmailService) {}

  @Post('pin/enviar')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@Body() body: EnviarPinEmailRequestDto): Promise<void> {
    await this.enviarPinEmailService.execute(body.email, body.tipoToken);
    return;
  }
}
