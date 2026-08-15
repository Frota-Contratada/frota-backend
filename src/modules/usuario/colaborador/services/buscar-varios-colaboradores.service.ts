import { Injectable, Logger } from '@nestjs/common';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { StorageServiceContract } from '@core/storage/contracts/storage-service.contract';
import { ColaboradorSummary } from '../domain/types/colaborador-summary.type';
import { ColaboradorRepositoryContract } from '../repositories/colaborador-repository.contract';

@Injectable()
export class BuscarVariosColaboradoresService {
  private readonly logger = new Logger(BuscarVariosColaboradoresService.name);

  constructor(
    private readonly colaboradorRepository: ColaboradorRepositoryContract,
    private readonly storageService: StorageServiceContract,
  ) {}

  async execute(filtros: {
    nome?: string;
    cpf?: string;
    filialId?: number;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<ColaboradorSummary>> {
    const resultado = await this.colaboradorRepository.buscarVarios(filtros);

    await this.carregarFotos(resultado.data);

    return resultado;
  }

  private async carregarFotos(
    colaboradores: ColaboradorSummary[],
  ): Promise<void> {
    await Promise.all(
      colaboradores.map(async (colaborador) => {
        if (!colaborador.caminhoFotoPerfil) {
          return;
        }

        try {
          colaborador.fotoPerfil = await this.storageService.lerComoDataUrl(
            colaborador.caminhoFotoPerfil,
          );
        } catch {
          this.logger.warn(
            `Foto de perfil não carregada para o colaborador ${colaborador.id}: ${colaborador.caminhoFotoPerfil}`,
          );
        }
      }),
    );
  }
}
