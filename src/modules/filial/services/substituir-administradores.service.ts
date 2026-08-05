import { Injectable } from '@nestjs/common';
import { FilialRepositoryContract } from '../repositories/filial-repository.contract';

@Injectable()
export class SubstituirAdministradoresService {
  constructor(private readonly filialRepository: FilialRepositoryContract) {}

  async executar(filialId: number, administradorIds: number[]): Promise<void> {
    await this.filialRepository.substituirAdministradores(
      filialId,
      administradorIds,
    );
  }
}
