import { Autenticacao } from '@module/autenticacao/domain/autenticacao';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

export abstract class AutenticacaoRepositoryContract {
  abstract buscarPorEmail(email: string): Promise<Autenticacao | null>;
  abstract buscarPorUsuarioId(usuarioId: number): Promise<Autenticacao | null>;
  abstract buscarPerfisVigentes(usuarioId: number): Promise<TipoPerfil[]>;
  abstract atualizarSenha(
    usuarioId: number,
    senha: string,
  ): Promise<Autenticacao | null>;
}
