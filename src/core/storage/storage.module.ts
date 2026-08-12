import { Module } from '@nestjs/common';
import { StorageServiceContract } from './contracts/storage-service.contract';
import { DiscoLocalStorageService } from './services/disco-local-storage.service';
import { ValidarArquivoService } from './services/validar-arquivo.service';

@Module({
  providers: [
    ValidarArquivoService,
    {
      provide: StorageServiceContract,
      useClass: DiscoLocalStorageService,
    },
  ],
  exports: [StorageServiceContract, ValidarArquivoService],
})
export class StorageModule {}
