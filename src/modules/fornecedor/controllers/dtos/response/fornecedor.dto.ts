export class FornecedorDto {
  id: number;
  nome: string;
  cnpjCpf: string;
  foto?: string;

  constructor(id: number, nome: string, cnpjCpf: string, foto?: string) {
    this.id = id;
    this.nome = nome;
    this.cnpjCpf = cnpjCpf;
    this.foto = foto;
  }
}
