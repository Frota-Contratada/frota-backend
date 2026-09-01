import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { CatalogoSolicitacaoRepositoryContract } from './catalogo-solicitacao-repository.contract';
import { PrismaCatalogoSolicitacaoMapper } from './prisma-catalogo-solicitacao.mapper';
import { Motivo } from '../domain/motivo';
import { TipoCorrida } from '../domain/tipo-corrida';
import { TipoVeiculo } from '../domain/tipo-veiculo';
import { TipoMotivo } from '../enums/tipo-motivo.enum';

@Injectable()
export class PrismaCatalogoSolicitacaoRepository extends CatalogoSolicitacaoRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async buscarMotivo(id: number): Promise<Motivo | null> {
    return PrismaCatalogoSolicitacaoMapper.motivoToDomain(
      await this.prismaService.motivo.findUnique({
        where: { nCdMotivo: id },
      }),
    );
  }

  async buscarMotivos(tipo?: TipoMotivo): Promise<Motivo[]> {
    const motivos = await this.prismaService.motivo.findMany({
      where: tipo ? { cTipoMotivo: tipo } : {},
      orderBy: { cNmMotivo: 'asc' },
    });

    return motivos.map((motivo) =>
      PrismaCatalogoSolicitacaoMapper.motivoToDomain(motivo),
    );
  }

  async buscarTipoCorrida(id: number): Promise<TipoCorrida | null> {
    return PrismaCatalogoSolicitacaoMapper.tipoCorridaToDomain(
      await this.prismaService.tipoCorrida.findUnique({
        where: { nCdTipoCorrida: id },
      }),
    );
  }

  async buscarTiposCorrida(): Promise<TipoCorrida[]> {
    const tipos = await this.prismaService.tipoCorrida.findMany({
      orderBy: { cNmTipoCorrida: 'asc' },
    });

    return tipos.map((tipo) =>
      PrismaCatalogoSolicitacaoMapper.tipoCorridaToDomain(tipo),
    );
  }

  async buscarTipoVeiculo(id: number): Promise<TipoVeiculo | null> {
    return PrismaCatalogoSolicitacaoMapper.tipoVeiculoToDomain(
      await this.prismaService.tipoVeiculo.findUnique({
        where: { nCdTpVeiculo: id },
      }),
    );
  }

  async buscarTiposVeiculo(): Promise<TipoVeiculo[]> {
    const tipos = await this.prismaService.tipoVeiculo.findMany({
      orderBy: { cNmTpVeiculo: 'asc' },
    });

    return tipos.map((tipo) =>
      PrismaCatalogoSolicitacaoMapper.tipoVeiculoToDomain(tipo),
    );
  }
}
