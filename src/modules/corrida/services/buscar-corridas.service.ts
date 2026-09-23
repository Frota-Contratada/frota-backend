import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { CorridaDto } from '../controllers/dtos/response/corrida.dto';
import {
  FiltrosCorrida,
  PrismaCorridaRepository,
} from '../repositories/prisma-corrida.repository';

@Injectable()
export class BuscarCorridasService {
  constructor(private readonly corridaRepository: PrismaCorridaRepository) {}

  async buscar(id: number, usuario: AuthenticatedUser): Promise<CorridaDto> {
    return CorridaDto.fromRecord(
      await this.corridaRepository.buscar(id, usuario),
    );
  }

  async listar(
    usuario: AuthenticatedUser,
    filtros: FiltrosCorrida,
  ): Promise<CorridaDto[]> {
    const corridas = await this.corridaRepository.listar(usuario, filtros);
    return corridas.map((corrida) => CorridaDto.fromRecord(corrida));
  }
}
