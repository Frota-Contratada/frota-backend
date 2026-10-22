import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoDespesa } from '../domain/tipo-despesa';
import { TrackingService } from './tracking.service';

@Injectable()
export class LancarDespesaCorridaService {
  constructor(private readonly trackingService: TrackingService) {}

  execute(
    corridaId: number,
    usuario: AuthenticatedUser,
    despesa: { tipo: TipoDespesa; valor: number },
  ): Promise<{
    id: number;
    tipo: TipoDespesa;
    valor: number;
    incluidaEm: string;
    valorFinalCorrida: number | null;
  }> {
    return this.trackingService.addExpense(corridaId, usuario, despesa);
  }
}
