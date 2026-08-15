import { DateTime } from 'luxon';

export class Fornecedor {
  constructor(
    public nome: string,
    public cnpjCpf: string,
    public dataAtivacao: DateTime,
    public id: number,
    public caminhoArquivo?: string,
    public dataDesativacao?: DateTime,
    public foto?: string,
  ) {}
}
