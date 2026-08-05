export class FornecedorDto {
  id: number;
  nome: string;
  cnpjCpf: string;

  constructor(id: number, nome: string, cnpjCpf: string) {
    this.id = id;
    this.nome = nome;
    this.cnpjCpf = cnpjCpf;
  }
}
