import { Module } from '@nestjs/common';
import { StorageServiceContract } from './contracts/storage-service.contract';
import { DiscoLocalStorageService } from './services/disco-local-storage.service';
import { MimeTypeService } from './services/mime-type.service';
import { ValidarArquivoService } from './services/validar-arquivo.service';

@Module({
  providers: [
    MimeTypeService,
    ValidarArquivoService,
    {
      provide: StorageServiceContract,
      useClass: DiscoLocalStorageService,
    },
  ],
  exports: [StorageServiceContract, ValidarArquivoService, MimeTypeService],
})
export class StorageModule {}
