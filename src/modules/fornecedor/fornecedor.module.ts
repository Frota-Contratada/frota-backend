import { Module } from '@nestjs/common';
import { FornecedorRepositoryContract } from './repositories/fornecedor-repository.contract';
import { PrismaFornecedorRepository } from './repositories/prisma-fornecedor.repository';
import { PrismaModule } from '@core/prisma/prisma.module';
import { FilialModule } from '@module/filial/filial.module';
import { CriarFornecedorController } from './controllers/criar-fornecedor.controller';
import { BuscarFornecedorController } from './controllers/buscar-fornecedor.controller';
import { CriarFornecedorService } from './services/criar-fornecedor.service';
import { BuscarFornecedorService } from './services/buscar-fornecedor.service';

@Module({
  imports: [PrismaModule, FilialModule],
  controllers: [CriarFornecedorController, BuscarFornecedorController],
  providers: [
    CriarFornecedorService,
    BuscarFornecedorService,
    {
      provide: FornecedorRepositoryContract,
      useClass: PrismaFornecedorRepository,
    },
  ],
  exports: [FornecedorRepositoryContract],
})
export class FornecedorModule {}
