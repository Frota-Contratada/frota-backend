import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { CriarEmpresaRequestDto } from './dtos/request/criar-empresa-request.dto';
import { EmpresaDto, paraEmpresaDto } from './dtos/response/empresa.dto';

@ApiTags('Empresa')
@Controller()
export class CriarEmpresaController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @Perfis(TipoPerfil.ADMIN_MASTER)
  async criar(
    @Body() body: CriarEmpresaRequestDto,
  ): Promise<ResponseInterface<EmpresaDto>> {
    try {
      const empresa = await this.prisma.empresa.create({
        data: {
          nCdEmpresa: body.empresaId,
          cNmEmpresa: body.nome,
          dAtivacao: new Date(body.ativacao),
        },
      });
      return { response: paraEmpresaDto(empresa) };
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
}
