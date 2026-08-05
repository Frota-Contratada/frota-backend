import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { CriarMotoristaRequestDto } from './dtos/request/criar-motorista-request.dto';
import { MotoristaDto } from './dtos/response/motorista.dto';
import { CriarMotoristaService } from '../services/criar-motorista.service';

@ApiTags('Motorista')
@Controller()
export class CriarMotoristaController {
  constructor(private readonly criarMotoristaService: CriarMotoristaService) {}

  @Post('/motoristas')
  async handle(
    @Body() body: CriarMotoristaRequestDto,
  ): Promise<ResponseInterface<MotoristaDto>> {
    const motorista = await this.criarMotoristaService.execute(
      body.nome,
      body.email,
      body.cpf,
      body.fornecedorId,
    );

    const response = new MotoristaDto(
      motorista.id,
      motorista.nome,
      motorista.email,
      motorista.cpf,
      motorista.fornecedorId,
    );

    return {
      response,
    };
  }
}
