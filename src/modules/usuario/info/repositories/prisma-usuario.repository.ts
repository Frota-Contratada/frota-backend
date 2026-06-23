import { MetodoNaoImplementadoException } from '@common/exceptions/metodo-nao-implementado.exception';
import { Injectable } from '@nestjs/common';
import { UsuarioRepositoryContract } from './usuario-repository.contract';
import { Usuario } from '../domain/usuario';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { PrismaUsuarioMapper } from './prisma-usuario.mapper';

@Injectable()
export class PrismaUsuarioRepository extends UsuarioRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }
  async buscar(id: number): Promise<Usuario> {
    throw new MetodoNaoImplementadoException();
  }
  async buscarVarios(): Promise<Usuario[]> {
    throw new MetodoNaoImplementadoException();
  }
  async contar(): Promise<number> {
    throw new MetodoNaoImplementadoException();
  }
  async atualizar(id: number, data: Usuario): Promise<Usuario> {
    throw new MetodoNaoImplementadoException();
  }
  async deletar(id: number): Promise<void> {
    throw new MetodoNaoImplementadoException();
  }
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return PrismaUsuarioMapper.toDomain(
      await this.prismaService.usuario.findUnique({
        where: {
          cEmail: email,
        },
      }),
    );
  }
}
