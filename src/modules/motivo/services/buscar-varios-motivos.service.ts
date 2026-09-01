import { Injectable } from '@nestjs/common';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { Motivo } from '../domain/motivo';
import {
  BuscarMotivosFiltros,
  MotivoRepositoryContract,
} from '../repositories/motivo-repository.contract';

@Injectable()
export class BuscarVariosMotivosService {
  constructor(private readonly motivoRepository: MotivoRepositoryContract) {}

  async execute(
    filtros: BuscarMotivosFiltros,
  ): Promise<PaginatedResponseInterface<Motivo>> {
    return this.motivoRepository.buscarVarios(filtros);
  }
}
