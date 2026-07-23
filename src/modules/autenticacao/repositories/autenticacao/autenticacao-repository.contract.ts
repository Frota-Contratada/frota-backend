import { Autenticacao } from '@module/autenticacao/domain/autenticacao';

export abstract class AutenticacaoRepositoryContract {
  abstract buscarPorEmail(email: string): Promise<Autenticacao | null>;
  abstract buscarPorUsuarioId(usuarioId: number): Promise<Autenticacao | null>;
  abstract atualizarSenha(
    usuarioId: number,
    senha: string,
  ): Promise<Autenticacao | null>;
}
