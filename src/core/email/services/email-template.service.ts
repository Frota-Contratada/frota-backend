import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { EmailTemplateInterface } from '../interfaces/email-template.interface';

@Injectable()
export class EmailTemplateService {
  private readonly templatesCarregados = new Map<string, string>();

  renderizar(template: EmailTemplateInterface): string {
    const html = this.carregarTemplate(template.caminhoArquivo);
    const entradas = Object.entries(template.campos);

    return entradas.reduce(
      (htmlAtual, [chave, valor]) =>
        htmlAtual.replaceAll(`{{${chave}}}`, valor),
      html,
    );
  }

  private carregarTemplate(caminhoTemplate: string): string {
    const templateCacheado = this.templatesCarregados.get(caminhoTemplate);

    if (templateCacheado) {
      return templateCacheado;
    }

    const conteudo = readFileSync(caminhoTemplate, 'utf-8');
    this.templatesCarregados.set(caminhoTemplate, conteudo);

    return conteudo;
  }
}
