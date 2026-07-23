import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { PinRepositoryContract } from './pin-repository.contract';
import { TipoToken } from '../../enums/tipo-token.enum';
import { Pin } from '../../domain/pin';
import { PrismaPinMapper } from './prisma-pin.mapper';

@Injectable()
export class PrismaPinRepository extends PinRepositoryContract {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async criar(
    usuarioId: number,
    tipoToken: TipoToken,
    pin: string,
  ): Promise<Pin> {
    const tipo = await this.prisma.tipoToken.findUniqueOrThrow({
      where: { nCdTpToken: tipoToken },
    });

    const expiraEm = new Date(Date.now() + tipo.nQtdSegValidade * 1000);

    const registro = await this.prisma.pinUsuario.create({
      data: {
        nCdUsuario: usuarioId,
        nCdTpToken: tipoToken,
        cPin: pin,
        dExpiracao: expiraEm,
      },
    });

    return PrismaPinMapper.toDomain(registro);
  }

  async encontrarPinAtivo(
    usuarioId: number,
    tipoToken: TipoToken,
    pin: string,
  ): Promise<Pin | null> {
    const registro = await this.prisma.pinUsuario.findFirst({
      where: {
        nCdUsuario: usuarioId,
        nCdTpToken: tipoToken,
        cPin: pin,
        cToken: null,
        cUtilizado: 'N',
        dExpiracao: { gt: new Date() },
      },
      orderBy: { dCriacao: 'desc' },
    });

    return PrismaPinMapper.toDomain(registro);
  }

  async definirToken(id: number, token: string): Promise<Pin> {
    const registro = await this.prisma.pinUsuario.update({
      where: { nCdPinUsuario: id },
      data: { cToken: token },
    });

    return PrismaPinMapper.toDomain(registro);
  }

  async encontrarTokenAtivo(
    token: string,
    tipoToken: TipoToken,
  ): Promise<Pin | null> {
    const registro = await this.prisma.pinUsuario.findFirst({
      where: {
        cToken: token,
        nCdTpToken: tipoToken,
        cUtilizado: 'N',
        dExpiracao: { gt: new Date() },
      },
    });

    return PrismaPinMapper.toDomain(registro);
  }

  async marcarComoUtilizado(id: number): Promise<void> {
    await this.prisma.pinUsuario.update({
      where: { nCdPinUsuario: id },
      data: { cUtilizado: 'S', dUtilizacao: new Date() },
    });
  }

  async invalidarAnteriores(
    usuarioId: number,
    tipoToken: TipoToken,
  ): Promise<void> {
    await this.prisma.pinUsuario.updateMany({
      where: {
        nCdUsuario: usuarioId,
        nCdTpToken: tipoToken,
        cUtilizado: 'N',
      },
      data: { cUtilizado: 'S' },
    });
  }
}
