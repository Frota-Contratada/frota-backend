import { Body, Controller, Post } from '@nestjs/common';
import { ConfirmarPinResponseDto } from '../dtos/response/confirmar-pin-response.dto';
import { ConfirmarPinRequestDto } from '../dtos/request/confirmar-pin-request.dto';
import { ResponseInterface } from '@common/interfaces/response-interface';

@Controller()
export class ConfirmarPinController {
  constructor() {}

  @Post('pin/confirmar')
  async handle(
    @Body() body: ConfirmarPinRequestDto,
  ): Promise<ResponseInterface<ConfirmarPinResponseDto>> {
    const response = new ConfirmarPinResponseDto();
    return { response };
  }
}
