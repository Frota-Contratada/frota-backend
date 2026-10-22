import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { EmailServiceContract } from '../contracts/email-service.contract';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplateInterface } from '../interfaces/email-template.interface';

@Injectable()
export class JbsEmailService extends EmailServiceContract {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {
    super();

    this.from = this.configService.get<string>('SMTP_FROM')!;

    // Servidores sem autenticação (relay interno) não recebem credenciais;
    // SMTP_SECURE=true usa TLS direto (porta 465), senão STARTTLS se oferecido.
    const usuario = this.configService.get<string>('SMTP_USER')?.trim();

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<string>('SMTP_PORT') ?? 587),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      ...(usuario
        ? {
            auth: {
              user: usuario,
              pass: this.configService.get<string>('SMTP_PASSWORD'),
            },
          }
        : {}),
    });
  }

  async verificarConexao(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }

  async enviarEmail(campos: {
    email: string;
    assunto: string;
    template: EmailTemplateInterface;
    cc?: string | string[];
    ccOculto?: string | string[];
  }): Promise<void> {
    const html = this.emailTemplateService.renderizar(campos.template);

    await this.transporter.sendMail({
      from: this.from,
      to: campos.email,
      cc: campos.cc,
      bcc: campos.ccOculto,
      subject: campos.assunto,
      html,
    });
  }
}
