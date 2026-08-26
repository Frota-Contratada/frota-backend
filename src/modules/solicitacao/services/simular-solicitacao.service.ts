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
import { SolicitacaoRepositoryContract } from '../repositories/solicitacao-repository.contract';
import { SolicitacaoHorarioDuplicadoException } from '../exceptions/solicitacao-horario-duplicado.exception';
import { CapacidadeVeiculoInsuficienteException } from '../exceptions/capacidade-veiculo-insuficiente.exception';
import { SelecionarFornecedorService } from './selecionar-fornecedor.service';

export interface SimularSolicitacaoInput {
  solicitanteId: number;
  dataCorrida: DateTime;
  tipoCorridaId: number;
  tipoVeiculoId?: number;
  cpfsAcompanhantes: string[];
  origem: EnderecoInput;
  destino: EnderecoInput;
  paradas: EnderecoInput[];
}

@Injectable()
export class SimularSolicitacaoService {
  constructor(
    private readonly catalogoRepository: CatalogoSolicitacaoRepositoryContract,
    private readonly solicitacaoRepository: SolicitacaoRepositoryContract,
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

    if (
      await this.solicitacaoRepository.existeConflitoDeHorario(
        input.solicitanteId,
        input.dataCorrida,
      )
    ) {
      throw new SolicitacaoHorarioDuplicadoException();
    }

    const tipoCorrida = await this.catalogoRepository.buscarTipoCorrida(
      input.tipoCorridaId,
    );

    if (!tipoCorrida) {
      throw new TipoCorridaNaoEncontradoException(input.tipoCorridaId);
    }

    const tipoVeiculo =
      input.tipoVeiculoId == null
        ? null
        : await this.catalogoRepository.buscarTipoVeiculo(input.tipoVeiculoId);

    if (input.tipoVeiculoId != null && tipoVeiculo == null) {
      throw new TipoVeiculoNaoEncontradoException(input.tipoVeiculoId);
    }

    if (
      tipoVeiculo != null &&
      !tipoCorrida.nome.toLowerCase().includes('objeto')
    ) {
      const quantidadePassageiros = 1 + input.cpfsAcompanhantes.length;

      if (quantidadePassageiros > tipoVeiculo.capacidadePassageiros) {
        throw new CapacidadeVeiculoInsuficienteException(
          tipoVeiculo.nome,
          tipoVeiculo.capacidadePassageiros,
          quantidadePassageiros,
        );
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
