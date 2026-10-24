import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpirarSolicitacoesPendentesService } from './expirar-solicitacoes-pendentes.service';

@Injectable()
export class ExpirarSolicitacoesPendentesJob
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ExpirarSolicitacoesPendentesJob.name);
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly config: ConfigService,
    private readonly expirar: ExpirarSolicitacoesPendentesService,
  ) {}

  onModuleInit(): void {
    const intervalo = this.intervaloEmMilissegundos();
    this.timer = setInterval(() => void this.executar(), intervalo);
    void this.executar();
  }

  onModuleDestroy(): void {
    if (this.timer != null) clearInterval(this.timer);
  }

  private async executar(): Promise<void> {
    try {
      const expiradas = await this.expirar.executar();
      if (expiradas.length > 0) {
        this.logger.log(
          `Solicitações expiradas automaticamente: ${expiradas
            .map(({ id }) => id)
            .join(', ')}`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Falha ao expirar solicitações pendentes.',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private intervaloEmMilissegundos(): number {
    const valor = Number(
      this.config.get<string>('SOLICITACOES_EXPIRACAO_INTERVALO_MS') ?? 60_000,
    );
    return Number.isInteger(valor) && valor >= 1_000 ? valor : 60_000;
  }
}
