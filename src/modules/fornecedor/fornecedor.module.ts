import { Module } from '@nestjs/common';
import { FornecedorRepositoryContract } from './repositories/fornecedor-repository.contract';
import { PrismaFornecedorRepository } from './repositories/prisma-fornecedor.repository';
import { PrismaModule } from '@core/prisma/prisma.module';
import { StorageModule } from '@core/storage/storage.module';
import { FilialModule } from '@module/filial/filial.module';
import { CriarFornecedorController } from './controllers/criar-fornecedor.controller';
import { BuscarFornecedorController } from './controllers/buscar-fornecedor.controller';
import { BuscarVariosFornecedoresController } from './controllers/buscar-varios-fornecedores.controller';
import { AtualizarFotoFornecedorController } from './controllers/atualizar-foto-fornecedor.controller';
import { CriarFornecedorService } from './services/criar-fornecedor.service';
import { BuscarFornecedorService } from './services/buscar-fornecedor.service';
import { BuscarVariosFornecedoresService } from './services/buscar-varios-fornecedores.service';
import { BuscarBigNumbersFornecedoresService } from './services/buscar-big-numbers-fornecedores.service';
import { AtualizarFotoFornecedorService } from './services/atualizar-foto-fornecedor.service';

@Module({
  imports: [PrismaModule, StorageModule, FilialModule],
  controllers: [
    CriarFornecedorController,
    BuscarVariosFornecedoresController,
    BuscarFornecedorController,
    AtualizarFotoFornecedorController,
  ],
  providers: [
    CriarFornecedorService,
    BuscarVariosFornecedoresService,
    BuscarBigNumbersFornecedoresService,
    BuscarFornecedorService,
    AtualizarFotoFornecedorService,
    {
      provide: FornecedorRepositoryContract,
      useClass: PrismaFornecedorRepository,
    },
  ],
  exports: [FornecedorRepositoryContract],
})
export class FornecedorModule {}
