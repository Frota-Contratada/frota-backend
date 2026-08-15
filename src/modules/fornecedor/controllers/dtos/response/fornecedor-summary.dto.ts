import { DateTime } from 'luxon';
import {
  ContratoVigenteSummary,
  FornecedorSummary,
} from '../../../domain/types/fornecedor-summary.type';

export class ContratoVigenteDto {
  contratoId: number;
  filialId: number;
  filialNome: string;
  dataVigenciaInicio: DateTime;
  dataVigenciaFim?: DateTime;
  dataAlteracao: DateTime;

  constructor(contrato: ContratoVigenteSummary) {
    this.contratoId = contrato.contratoId;
    this.filialId = contrato.filialId;
    this.filialNome = contrato.filialNome;
    this.dataVigenciaInicio = contrato.dataVigenciaInicio;
    this.dataVigenciaFim = contrato.dataVigenciaFim;
    this.dataAlteracao = contrato.dataAlteracao;
  }
}

export class FornecedorSummaryDto {
  id: number;
  nome: string;
  cnpjCpf: string;
  dataAtivacao: DateTime;
  ativo: boolean;
  quantidadeVeiculosAtivos: number;
  contratosVigentes: ContratoVigenteDto[];

  constructor(fornecedor: FornecedorSummary) {
    this.id = fornecedor.id;
    this.nome = fornecedor.nome;
    this.cnpjCpf = fornecedor.cnpjCpf;
    this.dataAtivacao = fornecedor.dataAtivacao;
    this.ativo = fornecedor.ativo;
    this.quantidadeVeiculosAtivos = fornecedor.quantidadeVeiculosAtivos;
    this.contratosVigentes = fornecedor.contratosVigentes.map(
      (contrato) => new ContratoVigenteDto(contrato),
    );
  }
}
