import { Body, Controller, Post } from '@nestjs/common';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { ConfirmarPinRequestDto } from './dtos/request/confirmar-pin-request.dto';
import { ConfirmarPinResponseDto } from './dtos/response/confirmar-pin-response.dto';
import { ConfirmarPinService } from '../services/confirmar-pin.service';

@Controller()
export class ConfirmarPinController {
  constructor(private readonly confirmarPinService: ConfirmarPinService) {}

  @Post('pin/confirmar')
  async handle(
    @Body() body: ConfirmarPinRequestDto,
  ): Promise<ResponseInterface<ConfirmarPinResponseDto>> {
    const result = await this.confirmarPinService.execute(
      body.email,
      body.tipoToken,
      body.pin,
    );
    const response = new ConfirmarPinResponseDto(result.token);
    return { response };
  }
}
