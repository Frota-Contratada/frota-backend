import { Injectable } from '@nestjs/common';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { UsuarioNaoPertenceAFilialException } from '../exceptions/usuario-nao-pertence-a-filial.exception';
import { FilialRepositoryContract } from '../repositories/filial-repository.contract';

@Injectable()
export class ValidarUsuarioNaFilialService {
  constructor(private readonly filialRepository: FilialRepositoryContract) {}

  async execute(
    usuarioId: number,
    filialId: number,
    tipoPerfil: TipoPerfil,
  ): Promise<void> {
    const pertence = await this.filialRepository.existeUsuarioNaFilialComPerfil(
      usuarioId,
      filialId,
      tipoPerfil,
    );

    if (!pertence) {
      throw new UsuarioNaoPertenceAFilialException(
        usuarioId,
        filialId,
        tipoPerfil,
      );
    }
  }
}
