import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { EmpresaDto, paraEmpresaDto } from './dtos/response/empresa.dto';

@ApiTags('Empresa')
@Controller()
export class BuscarEmpresaController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  async buscar(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<EmpresaDto>> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { nCdEmpresa: id },
    });
    if (!empresa) throw new NotFoundException('Empresa não encontrada');
    return { response: paraEmpresaDto(empresa) };
  }
}
