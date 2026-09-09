import { Injectable } from '@nestjs/common';
import { Endereco } from '../../filial/domain/endereco';
import {
  CondicaoOutro,
  CondicaoRegra,
  CondicaoRotaFixa,
} from '../domain/condicao-regra';
import { Regra } from '../domain/regra';
import type { RegraRequest } from '../controllers/dtos/request/substituir-regras-request.dto';
import { ContratoRepositoryContract } from '../repositories/contrato-repository.contract';

@Injectable()
export class SubstituirRegrasService {
  constructor(private readonly contratoRepository: ContratoRepositoryContract) {}

  async execute(contratoId: number, regras: RegraRequest[]): Promise<void> {
    await this.contratoRepository.substituirRegras(
      contratoId,
      regras.map((regra) =>
        new Regra(
          contratoId,
          0,
          regra.prioridade,
          regra.tipo,
          new CondicaoRegra(
            0,
            regra.condicao.diasSemana,
            regra.condicao.periodos,
            regra.condicao.rotasFixas.map(
              (rota) =>
                new CondicaoRotaFixa(
                  this.criarEndereco(rota.origem),
                  this.criarEndereco(rota.destino),
                ),
            ),
            regra.condicao.tipoVeiculoIds,
            regra.condicao.tipoCorridaIds,
            new CondicaoOutro(regra.condicao.outro.pergunta),
          ),
          regra.valorKm,
          regra.valorFixo,
          regra.percentual,
        ),
      ),
    );
  }

  private criarEndereco(endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    latitude: number;
    longitude: number;
  }): Endereco {
    return new Endereco(
      endereco.logradouro,
      endereco.numero,
      endereco.bairro,
      endereco.cidade,
      endereco.uf,
      endereco.cep,
      endereco.latitude,
      endereco.longitude,
      0,
      endereco.complemento,
    );
  }
}
