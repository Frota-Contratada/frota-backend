import { EmailTemplateInterface } from "../interfaces/email-template.interface";

export abstract class EmailServiceContract {
  abstract verificarConexao(): Promise<boolean>;
  abstract enviarEmail(campos: {email: string; assunto: string; template: EmailTemplateInterface; cc?: string |string []; ccOculto?: string | string[];}): Promise<void>;
}
