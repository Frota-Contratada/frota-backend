import { Module } from '@nestjs/common';
import { PrismaModule } from '@core/prisma/prisma.module';
import { FornecedorModule } from '@module/fornecedor/fornecedor.module';
import { BuscarVeiculosController } from './controllers/buscar-veiculos.controller';
import { CriarVeiculoController } from './controllers/criar-veiculo.controller';
import { PrismaVeiculoRepository } from './repositories/prisma-veiculo.repository';
import { VeiculoRepositoryContract } from './repositories/veiculo-repository.contract';
import { BuscarVariosVeiculosService } from './services/buscar-varios-veiculos.service';
import { BuscarVeiculoService } from './services/buscar-veiculo.service';
import { CriarVeiculoService } from './services/criar-veiculo.service';
import { ResolverEscopoVeiculoService } from './services/resolver-escopo-veiculo.service';

@Module({
  imports: [PrismaModule, FornecedorModule],
  controllers: [BuscarVeiculosController, CriarVeiculoController],
  providers: [
    BuscarVariosVeiculosService,
    BuscarVeiculoService,
    CriarVeiculoService,
    ResolverEscopoVeiculoService,
    {
      provide: VeiculoRepositoryContract,
      useClass: PrismaVeiculoRepository,
    },
  ],
})
export class VeiculoModule {}
