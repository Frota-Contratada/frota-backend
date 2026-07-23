import { Injectable } from '@nestjs/common';
import { AutenticacaoRepositoryContract } from './autenticacao-repository.contract';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { Autenticacao } from '../../domain/autenticacao';
import { PrismaAutenticacaoMapper } from './prisma-autenticacao.mapper';

@Injectable()
export class PrismaAutenticacaoRepository extends AutenticacaoRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async atualizarSenha(
    usuarioId: number,
    senha: string,
  ): Promise<Autenticacao | null> {
    return PrismaAutenticacaoMapper.toDomain(
      await this.prismaService.usuario.update({
        where: {
          nCdUsuario: usuarioId,
        },
        data: {
          cHashSenha: senha,
        },
      }),
    );
  }

  async buscarPorUsuarioId(usuarioId: number): Promise<Autenticacao | null> {
    return PrismaAutenticacaoMapper.toDomain(
      await this.prismaService.usuario.findUnique({
        where: {
          nCdUsuario: usuarioId,
        },
      }),
    );
  }

  async buscarPorEmail(email: string): Promise<Autenticacao | null> {
    return PrismaAutenticacaoMapper.toDomain(
      await this.prismaService.usuario.findUnique({
        where: {
          cEmail: email,
        },
      }),
    );
  }
}
