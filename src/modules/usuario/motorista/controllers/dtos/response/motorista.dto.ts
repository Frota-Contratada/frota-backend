export class MotoristaDto {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  fornecedorId?: number;

  constructor(
    id: number,
    nome: string,
    email: string,
    cpf?: string,
    fornecedorId?: number,
  ) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.cpf = cpf;
    this.fornecedorId = fornecedorId;
  }
}
