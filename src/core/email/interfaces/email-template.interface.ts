export interface EmailTemplateInterface<
  TCampos extends Record<string, string> = Record<string, string>,
> {
  caminhoArquivo: string;
  campos: TCampos;
}
