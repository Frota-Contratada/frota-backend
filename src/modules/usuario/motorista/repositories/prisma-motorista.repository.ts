import { Prisma } from '@prisma/client';
import { DirecaoOrdenacao } from '@common/enums/direcao-ordenacao.enum';
import { CampoOrdenacaoMotorista } from '../enums/ordenacao-motorista.enum';
import { Injectable } from '@nestjs/common';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { MotoristaRepositoryContract } from './motorista-repository.contract';
import { Motorista } from '../domain/motorista';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { PrismaMotoristaMapper } from './prisma-motorista.mapper';

const ORDENACAO_MOTORISTA: Record<
  CampoOrdenacaoMotorista,
  (direcao: DirecaoOrdenacao) => Prisma.UsuarioOrderByWithRelationInput
> = {
  [CampoOrdenacaoMotorista.NOME]: (direcao) => ({ cNmUsuario: direcao }),
  [CampoOrdenacaoMotorista.EMAIL]: (direcao) => ({ cEmail: direcao }),
  [CampoOrdenacaoMotorista.DATA_ATIVACAO]: (direcao) => ({
    dAtivacao: direcao,
  }),
};

@Injectable()
export class PrismaMotoristaRepository extends MotoristaRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async buscar(id: number): Promise<Motorista | null> {
    return PrismaMotoristaMapper.toDomain(
      await this.prismaService.usuario.findFirst({
        where: {
          nCdUsuario: id,
          nCdFornecedor: { not: null },
        },
      }),
    );
  }

  async buscarVarios(filtros: {
    nome?: string;
    cpf?: string;
    ordenarPor?: CampoOrdenacaoMotorista;
    direcao?: DirecaoOrdenacao;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<Motorista>> {
    const where = {
      nCdFornecedor: { not: null },
      ...(filtros.nome ? { cNmUsuario: { contains: filtros.nome } } : {}),
      ...(filtros.cpf ? { cCPF: { contains: filtros.cpf } } : {}),
    };
    const skip = (filtros.page - 1) * filtros.limit;

    const [motoristas, totalCount] = await Promise.all([
      this.prismaService.usuario.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy:
          filtros.ordenarPor == null
            ? { cNmUsuario: 'asc' }
            : ORDENACAO_MOTORISTA[filtros.ordenarPor](
                filtros.direcao ?? DirecaoOrdenacao.ASC,
              ),
      }),
      this.prismaService.usuario.count({ where }),
    ]);

    const data = motoristas.flatMap((motorista) => {
      const motoristaDomain = PrismaMotoristaMapper.toDomain(motorista);
      return motoristaDomain ? [motoristaDomain] : [];
    });

    return {
      data,
      totalCount,
      hasNextPage: filtros.page * filtros.limit < totalCount,
    };
  }

  async criar(motorista: Motorista): Promise<Motorista> {
    return this.prismaService.$transaction(async (tx) => {
      const ultimoUsuario = await tx.usuario.aggregate({
        _max: { nCdUsuario: true },
      });
      const proximoId = (ultimoUsuario._max.nCdUsuario?.toNumber() ?? 0) + 1;

      const registro = await tx.usuario.create({
        data: {
          nCdUsuario: proximoId,
          cNmUsuario: motorista.nome,
          cEmail: motorista.email,
          cCPF: motorista.cpf,
          cTelefone: motorista.telefone ?? null,
          nCdFornecedor: motorista.fornecedorId,
          cDisponivel: 'S',
        },
      });

      // Sem o perfil o motorista não entra no app nem na alocação.
      await tx.usuarioPerfil.create({
        data: {
          nCdUsuario: proximoId,
          cTipoPerfil: TipoPerfil.MOTORISTA,
          dInicioVigencia: new Date(),
        },
      });

      return PrismaMotoristaMapper.toDomain(registro);
    });
  }
}
