export class MotoristaDto {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  fornecedorId?: number;
  telefone?: string;
  dataAtivacao?: string;

  constructor(
    id: number,
    nome: string,
    email: string,
    cpf?: string,
    fornecedorId?: number,
    telefone?: string,
    dataAtivacao?: string,
  ) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.cpf = cpf;
    this.fornecedorId = fornecedorId;
    this.telefone = telefone;
    this.dataAtivacao = dataAtivacao;
  }
}
