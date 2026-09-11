import { Module } from '@nestjs/common';
import { BullMqQueueFactory } from './bullmq-queue.factory';

@Module({
  providers: [BullMqQueueFactory],
  exports: [BullMqQueueFactory],
})
export class QueueModule {}
