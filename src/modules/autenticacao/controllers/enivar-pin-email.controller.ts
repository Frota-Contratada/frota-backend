import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { EnviarPinEmailRequestDto } from '../dtos/request/enivar-pin-email-request.dto';

@Controller()
export class EnviarPinEmailController {
  constructor() {}

  @Post('pin/enviar')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@Body() body: EnviarPinEmailRequestDto): Promise<void> {
    return;
  }
}
