import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { RotaServiceContract } from '@core/rota/contracts/rota-service.contract';
import { UsuarioRepositoryContract } from '@module/usuario/info/repositories/usuario-repository.contract';
import { SimulacaoSolicitacao } from '../domain/simulacao-solicitacao';
import { CatalogoSolicitacaoRepositoryContract } from '../repositories/catalogo-solicitacao-repository.contract';
import { SolicitanteNaoEncontradoException } from '../exceptions/solicitante-nao-encontrado.exception';
import { SolicitanteSemFilialException } from '../exceptions/solicitante-sem-filial.exception';
import { TipoCorridaNaoEncontradoException } from '../exceptions/tipo-corrida-nao-encontrado.exception';
import { TipoVeiculoNaoEncontradoException } from '../exceptions/tipo-veiculo-nao-encontrado.exception';
import { EnderecoInput } from './criar-solicitacao.service';
import { SelecionarFornecedorService } from './selecionar-fornecedor.service';

export interface SimularSolicitacaoInput {
  solicitanteId: number;
  dataCorrida: DateTime;
  tipoCorridaId: number;
  tipoVeiculoId?: number;
  origem: EnderecoInput;
  destino: EnderecoInput;
  paradas: EnderecoInput[];
}

@Injectable()
export class SimularSolicitacaoService {
  constructor(
    private readonly catalogoRepository: CatalogoSolicitacaoRepositoryContract,
    private readonly usuarioRepository: UsuarioRepositoryContract,
    private readonly rotaService: RotaServiceContract,
    private readonly selecionarFornecedorService: SelecionarFornecedorService,
  ) {}

  async execute(input: SimularSolicitacaoInput): Promise<SimulacaoSolicitacao> {
    const solicitante = await this.usuarioRepository.buscar(
      input.solicitanteId,
    );

    if (!solicitante) {
      throw new SolicitanteNaoEncontradoException(input.solicitanteId);
    }

    if (solicitante.filialId == null) {
      throw new SolicitanteSemFilialException(input.solicitanteId);
    }

    const tipoCorrida = await this.catalogoRepository.buscarTipoCorrida(
      input.tipoCorridaId,
    );

    if (!tipoCorrida) {
      throw new TipoCorridaNaoEncontradoException(input.tipoCorridaId);
    }

    if (input.tipoVeiculoId != null) {
      const tipoVeiculo = await this.catalogoRepository.buscarTipoVeiculo(
        input.tipoVeiculoId,
      );

      if (!tipoVeiculo) {
        throw new TipoVeiculoNaoEncontradoException(input.tipoVeiculoId);
      }
    }

    const rota = await this.rotaService.calcular(
      [input.origem, ...input.paradas, input.destino].map((endereco) => ({
        latitude: endereco.latitude,
        longitude: endereco.longitude,
      })),
    );

    const fornecedor = await this.selecionarFornecedorService.execute(
      solicitante.filialId,
      {
        distanciaKm: rota.distanciaKm,
        dataCorrida: input.dataCorrida,
        tipoCorridaId: tipoCorrida.id,
        tipoVeiculoId: input.tipoVeiculoId,
        quantidadeParadas: input.paradas.length,
      },
    );

    return new SimulacaoSolicitacao(
      rota.distanciaKm,
      rota.duracaoMinutos,
      input.dataCorrida,
      fornecedor.valorEstimado,
      fornecedor.fornecedorId,
      fornecedor.fornecedorNome,
    );
  }
}
