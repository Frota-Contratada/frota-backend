import { Usuario } from '../domain/usuario';

export abstract class UsuarioRepositoryContract {
  abstract buscar(id: number): Promise<Usuario | null>;
  abstract buscarComPerfisVigentes(id: number): Promise<Usuario | null>;
  abstract buscarVarios(): Promise<Usuario[]>;
  abstract contar(): Promise<number>;
  abstract atualizar(id: number, data: Usuario): Promise<Usuario>;
  abstract atualizarFotoPerfil(
    id: number,
    caminhoFotoPerfil: string,
  ): Promise<Usuario>;
  abstract deletar(id: number): Promise<void>;
  abstract buscarPorEmail(email: string): Promise<Usuario | null>;
  abstract buscarPorCpf(cpf: string): Promise<Usuario | null>;
}
