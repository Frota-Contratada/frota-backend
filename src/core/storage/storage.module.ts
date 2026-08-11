import { Module } from '@nestjs/common';
import { StorageServiceContract } from './contracts/storage-service.contract';
import { DiscoLocalStorageService } from './services/disco-local-storage.service';

@Module({
  providers: [
    {
      provide: StorageServiceContract,
      useClass: DiscoLocalStorageService,
    },
  ],
  exports: [StorageServiceContract],
})
export class StorageModule {}
