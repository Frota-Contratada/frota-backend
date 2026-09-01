import { Injectable } from '@nestjs/common';
import { Motivo } from '../domain/motivo';
import { MotivoDeOutraFilialException } from '../exceptions/motivo-de-outra-filial.exception';
import { MotivoGlobalNaoGerenciavelException } from '../exceptions/motivo-global-nao-gerenciavel.exception';

/**
 * Garante que um admin de filial só gerencie motivos da própria filial.
 * Motivo global é somente leitura para esse perfil.
 */
@Injectable()
export class ValidarMotivoDaFilialService {
  execute(motivo: Motivo, filialId: number): void {
    if (motivo.global) {
      throw new MotivoGlobalNaoGerenciavelException(motivo.id);
    }

    if (motivo.filialId !== filialId) {
      throw new MotivoDeOutraFilialException(motivo.id, filialId);
    }
  }
}
