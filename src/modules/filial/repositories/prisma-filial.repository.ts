import { Injectable } from '@nestjs/common';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { AdministradorNaoEncontradoException } from '../exceptions/administrador-nao-encontrado.exception';
import { FilialNaoEncontradaException } from '../exceptions/filial-nao-encontrada.exception';
import { FilialRepositoryContract, FiltrosFilial } from './filial-repository.contract';
import { Filial } from '../domain/filial';
import { Endereco } from '../domain/endereco';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { PrismaFilialMapper } from './prisma-filial.mapper';

@Injectable()
export class PrismaFilialRepository extends FilialRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async buscar(id: number): Promise<Filial | null> {
    return PrismaFilialMapper.toDomain(
      await this.prismaService.filial.findUnique({
        where: { nCdFilial: id },
        include: { Endereco: true },
      }),
    );
  }

  async buscarVarios(filtros: FiltrosFilial): Promise<Filial[]> {
    const filiais = await this.prismaService.filial.findMany({
      where: {
        ...(filtros.cnpj
          ? { cCNPJ: { contains: filtros.cnpj } }
          : {}),
        ...(filtros.nome
          ? { cNmFilial: { contains: filtros.nome } }
          : {}),
      },
      include: { Endereco: true },
      orderBy: { cNmFilial: 'asc' },
    });

    return filiais.map((filial) => PrismaFilialMapper.toDomain(filial)!);
  }

  async criar(filial: Filial): Promise<Filial> {
    return this.prismaService.$transaction(async (tx) => {
      const ultimoEndereco = await tx.endereco.aggregate({
        _max: { nCdEndereco: true },
      });
      const proximoEnderecoId =
        (ultimoEndereco._max.nCdEndereco?.toNumber() ?? 0) + 1;

      await tx.endereco.create({
        data: {
          nCdEndereco: proximoEnderecoId,
          cEndereco: filial.endereco.logradouro,
          cNumero: filial.endereco.numero,
          cComplemento: filial.endereco.complemento ?? null,
          cBairro: filial.endereco.bairro,
          cCidade: filial.endereco.cidade,
          cUf: filial.endereco.uf,
          cCEP: filial.endereco.cep,
          nLatitude: filial.endereco.latitude,
          nLongitude: filial.endereco.longitude,
        },
      });

      const ultimaFilial = await tx.filial.aggregate({
        _max: { nCdFilial: true },
      });
      const proximoFilialId =
        (ultimaFilial._max.nCdFilial?.toNumber() ?? 0) + 1;

      return PrismaFilialMapper.toDomain(
        await tx.filial.create({
          data: {
            nCdFilial: proximoFilialId,
            cNmFilial: filial.nome,
            cCNPJ: filial.cnpj,
            nCdEndereco: proximoEnderecoId,
          },
          include: { Endereco: true },
        }),
      );
    });
  }

  async atualizar(
    id: number,
    nome: string,
    endereco: Endereco,
  ): Promise<Filial> {
    return this.prismaService.$transaction(async (tx) => {
      const filialAtual = await tx.filial.findUnique({
        where: { nCdFilial: id },
      });

      if (!filialAtual) {
        throw new FilialNaoEncontradaException(id);
      }

      await tx.filial.update({
        where: { nCdFilial: id },
        data: { cNmFilial: nome },
      });

      await tx.endereco.update({
        where: { nCdEndereco: filialAtual.nCdEndereco },
        data: {
          cEndereco: endereco.logradouro,
          cNumero: endereco.numero,
          cComplemento: endereco.complemento ?? null,
          cBairro: endereco.bairro,
          cCidade: endereco.cidade,
          cUf: endereco.uf,
          cCEP: endereco.cep,
          nLatitude: endereco.latitude,
          nLongitude: endereco.longitude,
        },
      });

      const filialAtualizada = await tx.filial.findUnique({
        where: { nCdFilial: id },
        include: { Endereco: true },
      });

      if (!filialAtualizada) {
        throw new FilialNaoEncontradaException(id);
      }

      return PrismaFilialMapper.toDomain(filialAtualizada);
    });
  }

  async substituirAdministradores(
    filialId: number,
    administradorIds: number[],
  ): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const filial = await tx.filial.findUnique({
        where: { nCdFilial: filialId },
        select: { nCdFilial: true },
      });

      if (!filial) {
        throw new FilialNaoEncontradaException(filialId);
      }

      const idsUnicos = [...new Set(administradorIds)];
      const agora = new Date();
      const administradores = await tx.usuario.findMany({
        where: {
          nCdUsuario: { in: idsUnicos },
          dDesativacao: null,
          UsuarioPerfil: {
            some: {
              cTipoPerfil: TipoPerfil.ADMIN_FILIAL,
              dInicioVigencia: { lte: agora },
              OR: [
                { dFimVigencia: null },
                { dFimVigencia: { gt: agora } },
              ],
            },
          },
        },
        select: { nCdUsuario: true },
      });

      const idsEncontrados = new Set(
        administradores.map((administrador) =>
          administrador.nCdUsuario.toNumber(),
        ),
      );
      const administradorInvalido = idsUnicos.find(
        (id) => !idsEncontrados.has(id),
      );

      if (administradorInvalido !== undefined) {
        throw new AdministradorNaoEncontradoException(administradorInvalido);
      }

      await tx.usuario.updateMany({
        where: {
          nCdFilial: filialId,
          UsuarioPerfil: {
            some: {
              cTipoPerfil: TipoPerfil.ADMIN_FILIAL,
              dInicioVigencia: { lte: agora },
              OR: [
                { dFimVigencia: null },
                { dFimVigencia: { gt: agora } },
              ],
            },
          },
        },
        data: { nCdFilial: null },
      });

      if (idsUnicos.length > 0) {
        await tx.usuario.updateMany({
          where: { nCdUsuario: { in: idsUnicos } },
          data: { nCdFilial: filialId },
        });
      }
    });
  }

  async existePorNome(nome: string): Promise<boolean> {
    const resultado = await this.prismaService.filial.findUnique({
      where: { cNmFilial: nome },
      select: { nCdFilial: true },
    });
    return resultado !== null;
  }

  async existePorCnpj(cnpj: string): Promise<boolean> {
    const resultado = await this.prismaService.filial.findUnique({
      where: { cCNPJ: cnpj },
      select: { nCdFilial: true },
    });
    return resultado !== null;
  }
}
