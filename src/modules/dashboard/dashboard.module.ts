import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { BuscarDashboardController } from './controllers/buscar-dashboard.controller';
import { BuscarDashboardGastosController } from './controllers/buscar-dashboard-gastos.controller';
import { BuscarDashboardAuditoriaController } from './controllers/buscar-dashboard-auditoria.controller';
import { DashboardRepositoryContract } from './repositories/dashboard-repository.contract';
import { PrismaDashboardRepository } from './repositories/prisma-dashboard.repository';
import { BuscarDashboardService } from './services/buscar-dashboard.service';
import { BuscarDashboardGastosService } from './services/buscar-dashboard-gastos.service';
import { BuscarDashboardAuditoriaService } from './services/buscar-dashboard-auditoria.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    BuscarDashboardController,
    BuscarDashboardGastosController,
    BuscarDashboardAuditoriaController,
  ],
  providers: [
    BuscarDashboardService,
    BuscarDashboardGastosService,
    BuscarDashboardAuditoriaService,
    {
      provide: DashboardRepositoryContract,
      useClass: PrismaDashboardRepository,
    },
  ],
})
export class DashboardModule {}
