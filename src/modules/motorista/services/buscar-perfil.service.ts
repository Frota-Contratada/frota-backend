import { Injectable } from '@nestjs/common';
import { StorageServiceContract } from '@core/storage/contracts/storage-service.contract';
import { UsuarioNaoEncontradoException } from '@module/usuario/info/exceptions/usuario-nao-encontrado.exception';
import { MotoristaPerfil } from '../domain/motorista-corrida';
import { MotoristaCorridaRepositoryContract } from '../repositories/motorista-corrida-repository.contract';

@Injectable()
export class BuscarPerfilService {
  constructor(
    private readonly repository: MotoristaCorridaRepositoryContract,
    private readonly storageService: StorageServiceContract,
  ) {}

  async execute(motoristaId: number): Promise<MotoristaPerfil> {
    const perfil = await this.repository.buscarPerfil(motoristaId);
    if (!perfil) throw new UsuarioNaoEncontradoException();

    if (perfil.fotoPerfil) {
      perfil.fotoPerfil = await this.storageService.lerComoDataUrl(
        perfil.fotoPerfil,
      );
    }

    return perfil;
  }
}
