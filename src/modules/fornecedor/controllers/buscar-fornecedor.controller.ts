import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { BuscarFornecedorService } from '../services/buscar-fornecedor.service';
import { FornecedorDto } from './dtos/response/fornecedor.dto';

@ApiTags('Fornecedor')
@Controller()
export class BuscarFornecedorController {
  constructor(
    private readonly buscarFornecedorService: BuscarFornecedorService,
  ) {}

  @Get(':id')
  async buscar(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<FornecedorDto>> {
    const fornecedor = await this.buscarFornecedorService.execute(id);

    return {
      response: new FornecedorDto(
        fornecedor.id,
        fornecedor.nome,
        fornecedor.cnpjCpf,
        fornecedor.foto,
      ),
    };
  }
}
