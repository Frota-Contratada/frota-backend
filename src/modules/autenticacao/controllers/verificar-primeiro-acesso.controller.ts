import { Body, Controller, Get, Param } from '@nestjs/common';
import { VerificarPrimeiroAcessoService } from '../services/verificar-primeiro-acesso.service';
import { VerificarPrimeiroAcessoResponseDto } from './dtos/response/verificar-primeiro-acesso-response.dto';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';

@Controller()
export class VerificarPrimeiroAcessoController {
  constructor(
    private readonly verificarPrimeiroAcessoService: VerificarPrimeiroAcessoService,
  ) {}

  @Get('/primeiro-acesso/:email')
  async handle(
    @Param('email', new ZodValidationPipe(z.string().email('E-mail inválido')))
    email: string,
  ): Promise<ResponseInterface<VerificarPrimeiroAcessoResponseDto>> {
    const result = await this.verificarPrimeiroAcessoService.execute(email);

    return {
      response: new VerificarPrimeiroAcessoResponseDto(result),
    };
  }
}
