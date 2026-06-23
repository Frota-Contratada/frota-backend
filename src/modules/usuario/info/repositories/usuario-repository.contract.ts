import { Usuario } from '../domain/usuario';

export abstract class UsuarioRepositoryContract {
  abstract buscar(id: number): Promise<Usuario | null>;
  abstract buscarVarios(): Promise<Usuario[]>;
  abstract contar(): Promise<number>;
  abstract atualizar(id: number, data: Usuario): Promise<Usuario>;
  abstract deletar(id: number): Promise<void>;
  abstract buscarPorEmail(email: String): Promise<Usuario | null>;
}
