import { Module } from '@nestjs/common';
import { EmailServiceContract } from './contracts/email-service.contract';
import { JbsEmailService } from './services/jbs-email.service';
import { EmailTemplateService } from './services/email-template.service';

@Module({
  providers: [
    EmailTemplateService,
    {
      provide: EmailServiceContract,
      useClass: JbsEmailService,
    },
  ],
  exports: [EmailServiceContract],
})
export class EmailModule {}
