import { ConflictException } from '@nestjs/common';
import { TipoMotivo } from '../enums/tipo-motivo.enum';

export class MotivoNomeJaCadastradoException extends ConflictException {
  constructor(nome: string, tipo: TipoMotivo, filialId?: number) {
    super(
      filialId === undefined
        ? `Já existe um motivo global de ${tipo} com o nome ${nome}`
        : `Já existe um motivo de ${tipo} com o nome ${nome} disponível para a filial ${filialId}`,
    );
  }
}
