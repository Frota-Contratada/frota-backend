import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { ZodValidationPipe, createZodDto } from 'nestjs-zod';
import z from 'zod';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

const CriarEmpresaSchema = z.object({
  empresaId: z.number().int().positive(),
  nome: z.string().min(1).max(100),
  ativacao: z.iso.datetime(),
});

class CriarEmpresaDto extends createZodDto(CriarEmpresaSchema) {}

interface EmpresaDto {
  empresaId: number;
  nome: string;
  ativacao: Date;
  desativacao: Date | null;
}

@ApiTags('Empresa')
@Controller()
export class EmpresaController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @Perfis(TipoPerfil.ADMIN_MASTER)
  async criar(
    @Body() body: CriarEmpresaDto,
  ): Promise<ResponseInterface<EmpresaDto>> {
    try {
      const empresa = await this.prisma.empresa.create({
        data: {
          nCdEmpresa: body.empresaId,
          cNmEmpresa: body.nome,
          dAtivacao: new Date(body.ativacao),
        },
      });
      return { response: this.paraDto(empresa) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Empresa já cadastrada');
      }
      throw error;
    }
  }

  @Get(':id')
  async buscar(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<EmpresaDto>> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { nCdEmpresa: id },
    });
    if (!empresa) throw new NotFoundException('Empresa não encontrada');
    return { response: this.paraDto(empresa) };
  }

  private paraDto(empresa: {
    nCdEmpresa: Prisma.Decimal;
    cNmEmpresa: string;
    dAtivacao: Date;
    dDesativacao: Date | null;
  }): EmpresaDto {
    return {
      empresaId: empresa.nCdEmpresa.toNumber(),
      nome: empresa.cNmEmpresa,
      ativacao: empresa.dAtivacao,
      desativacao: empresa.dDesativacao,
    };
  }
}
