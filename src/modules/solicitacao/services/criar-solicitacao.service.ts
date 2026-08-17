import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { RotaServiceContract } from '@core/rota/contracts/rota-service.contract';
import { UsuarioRepositoryContract } from '@module/usuario/info/repositories/usuario-repository.contract';
import { ColaboradorRepositoryContract } from '@module/usuario/colaborador/repositories/colaborador-repository.contract';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { CentroCustoRepositoryContract } from '@module/centro-de-custo/repositories/centro-custo-repository.contract';
import { CentroCustoNaoEncontradoException } from '@module/centro-de-custo/exceptions/centro-custo-nao-encontrado.exception';
import { CentroCustoInativoException } from '@module/centro-de-custo/exceptions/centro-custo-inativo.exception';
import { CentroCustoSemAprovadorException } from '@module/centro-de-custo/exceptions/centro-custo-sem-aprovador.exception';
import { Endereco } from '../domain/endereco';
import { Motivo } from '../domain/motivo';
import { Parada } from '../domain/parada';
import { Solicitacao } from '../domain/solicitacao';
import { SolicitacaoCentroCusto } from '../domain/solicitacao-centro-custo';
import { SolicitacaoPassageiro } from '../domain/solicitacao-passageiro';
import { TipoVeiculo } from '../domain/tipo-veiculo';
import { TipoMotivo } from '../enums/tipo-motivo.enum';
import { CatalogoSolicitacaoRepositoryContract } from '../repositories/catalogo-solicitacao-repository.contract';
import { SolicitacaoRepositoryContract } from '../repositories/solicitacao-repository.contract';
import { AcompanhanteDuplicadoException } from '../exceptions/acompanhante-duplicado.exception';
import { AcompanhanteNaoEncontradoException } from '../exceptions/acompanhante-nao-encontrado.exception';
import { CentroCustoDuplicadoException } from '../exceptions/centro-custo-duplicado.exception';
import { DataCorridaInvalidaException } from '../exceptions/data-corrida-invalida.exception';
import { MotivoNaoEncontradoException } from '../exceptions/motivo-nao-encontrado.exception';
import { SolicitanteNaoEncontradoException } from '../exceptions/solicitante-nao-encontrado.exception';
import { SolicitanteSemFilialException } from '../exceptions/solicitante-sem-filial.exception';
import { TipoCorridaNaoEncontradoException } from '../exceptions/tipo-corrida-nao-encontrado.exception';
import { TipoVeiculoNaoEncontradoException } from '../exceptions/tipo-veiculo-nao-encontrado.exception';
import { SelecionarFornecedorService } from './selecionar-fornecedor.service';

export interface EnderecoInput {
  logradouro: string;
  cidade: string;
  uf: string;
  latitude: number;
  longitude: number;
  numero?: string;
  bairro?: string;
  cep?: string;
  complemento?: string;
}

export interface CriarSolicitacaoInput {
  solicitanteId: number;
  dataCorrida: DateTime;
  tipoCorridaId: number;
  tipoVeiculoId?: number;
  motivoSolicitacaoId: number;
  origem: EnderecoInput;
  destino: EnderecoInput;
  paradas: EnderecoInput[];
  centrosCustoIds: number[];
  cpfsAcompanhantes: string[];
}

@Injectable()
export class CriarSolicitacaoService {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepositoryContract,
    private readonly catalogoRepository: CatalogoSolicitacaoRepositoryContract,
    private readonly usuarioRepository: UsuarioRepositoryContract,
    private readonly colaboradorRepository: ColaboradorRepositoryContract,
    private readonly centroCustoRepository: CentroCustoRepositoryContract,
    private readonly rotaService: RotaServiceContract,
    private readonly selecionarFornecedorService: SelecionarFornecedorService,
  ) {}

  async execute(input: CriarSolicitacaoInput): Promise<Solicitacao> {
    if (input.dataCorrida <= DateTime.now()) {
      throw new DataCorridaInvalidaException();
    }

    const solicitante = await this.usuarioRepository.buscar(
      input.solicitanteId,
    );

    if (!solicitante) {
      throw new SolicitanteNaoEncontradoException(input.solicitanteId);
    }

    if (solicitante.filialId == null) {
      throw new SolicitanteSemFilialException(input.solicitanteId);
    }

    const filialId = solicitante.filialId;

    const tipoCorrida = await this.catalogoRepository.buscarTipoCorrida(
      input.tipoCorridaId,
    );

    if (!tipoCorrida) {
      throw new TipoCorridaNaoEncontradoException(input.tipoCorridaId);
    }

    const tipoVeiculo = await this.resolverTipoVeiculo(input.tipoVeiculoId);

    const motivoSolicitacao = await this.catalogoRepository.buscarMotivo(
      input.motivoSolicitacaoId,
    );

    if (!motivoSolicitacao) {
      throw new MotivoNaoEncontradoException(input.motivoSolicitacaoId);
    }

    const origem = this.paraEndereco(input.origem);
    const destino = this.paraEndereco(input.destino);
    const paradas = input.paradas.map(
      (parada, indice) => new Parada(indice + 1, this.paraEndereco(parada)),
    );

    const rota = await this.rotaService.calcular(
      [origem, ...paradas.map((parada) => parada.endereco), destino].map(
        (endereco) => ({
          latitude: endereco.latitude,
          longitude: endereco.longitude,
        }),
      ),
    );

    const fornecedor = await this.selecionarFornecedorService.execute(
      filialId,
      {
        distanciaKm: rota.distanciaKm,
        dataCorrida: input.dataCorrida,
        tipoCorridaId: tipoCorrida.id,
        tipoVeiculoId: tipoVeiculo?.id,
        quantidadeParadas: paradas.length,
      },
    );

    const centrosCusto = await this.resolverCentrosCusto(
      filialId,
      input.centrosCustoIds,
    );

    const passageiros = await this.resolverPassageiros(
      motivoSolicitacao,
      solicitante.cpf,
      input.cpfsAcompanhantes,
    );

    const solicitacao = new Solicitacao(
      solicitante.id,
      fornecedor.fornecedorId,
      tipoCorrida,
      input.dataCorrida,
      origem,
      destino,
      motivoSolicitacao,
      rota.distanciaKm,
      fornecedor.valorEstimado,
      {
        tipoVeiculo,
        paradas,
        centrosCusto,
        passageiros,
        duracaoEstimadaMinutos: rota.duracaoMinutos,
        solicitanteNome: solicitante.nome,
        fornecedorNome: fornecedor.fornecedorNome,
      },
    );

    const criada = await this.solicitacaoRepository.criar(solicitacao);
    criada.duracaoEstimadaMinutos = rota.duracaoMinutos;

    return criada;
  }

  private async resolverTipoVeiculo(
    tipoVeiculoId?: number,
  ): Promise<TipoVeiculo | undefined> {
    if (tipoVeiculoId == null) return undefined;

    const tipoVeiculo =
      await this.catalogoRepository.buscarTipoVeiculo(tipoVeiculoId);

    if (!tipoVeiculo) {
      throw new TipoVeiculoNaoEncontradoException(tipoVeiculoId);
    }

    return tipoVeiculo;
  }

  private async resolverCentrosCusto(
    filialId: number,
    centrosCustoIds: number[],
  ): Promise<SolicitacaoCentroCusto[]> {
    const vistos = new Set<number>();
    const rateios: SolicitacaoCentroCusto[] = [];

    for (const centroCustoId of centrosCustoIds) {
      if (vistos.has(centroCustoId)) {
        throw new CentroCustoDuplicadoException(centroCustoId);
      }

      vistos.add(centroCustoId);

      const centroCusto = await this.centroCustoRepository.buscar(
        filialId,
        centroCustoId,
      );

      if (!centroCusto) {
        throw new CentroCustoNaoEncontradoException(filialId, centroCustoId);
      }

      if (centroCusto.dataDesativacao != null) {
        throw new CentroCustoInativoException(filialId, centroCustoId);
      }

      const aprovadorId = await this.centroCustoRepository.buscarAprovadorId(
        filialId,
        centroCustoId,
      );

      if (aprovadorId == null) {
        throw new CentroCustoSemAprovadorException(filialId, centroCustoId);
      }

      rateios.push(
        new SolicitacaoCentroCusto(
          filialId,
          centroCustoId,
          aprovadorId,
          undefined,
          centroCusto.nome,
        ),
      );
    }

    return rateios;
  }

  private async resolverPassageiros(
    motivoSolicitacao: Motivo,
    cpfSolicitante: string | undefined,
    cpfsAcompanhantes: string[],
  ): Promise<SolicitacaoPassageiro[]> {
    if (motivoSolicitacao.tipo === TipoMotivo.OBJETO_TRANSPORTADO) {
      return [];
    }

    const passageiros: SolicitacaoPassageiro[] = [];
    const vistos = new Set<string>();

    if (cpfSolicitante) {
      passageiros.push(
        new SolicitacaoPassageiro(cpfSolicitante, undefined, true),
      );
      vistos.add(cpfSolicitante);
    }

    for (const cpf of cpfsAcompanhantes) {
      if (vistos.has(cpf)) {
        throw new AcompanhanteDuplicadoException(cpf);
      }

      vistos.add(cpf);
    }

    const encontrados = await this.colaboradorRepository.buscarPorCpfs(
      cpfsAcompanhantes,
      [TipoPerfil.SOLICITANTE, TipoPerfil.SOLICITANTE_EMERGENCIA],
    );
    const nomePorCpf = new Map(
      encontrados.flatMap((colaborador): [string, string][] =>
        colaborador.cpf == null ? [] : [[colaborador.cpf, colaborador.nome]],
      ),
    );

    for (const cpf of cpfsAcompanhantes) {
      const nome = nomePorCpf.get(cpf);

      if (nome == null) {
        throw new AcompanhanteNaoEncontradoException(cpf);
      }

      passageiros.push(new SolicitacaoPassageiro(cpf, nome));
    }

    return passageiros;
  }

  private paraEndereco(input: EnderecoInput): Endereco {
    return new Endereco(
      input.logradouro,
      input.cidade,
      input.uf,
      input.latitude,
      input.longitude,
      0,
      input.numero,
      input.bairro,
      input.cep,
      input.complemento,
    );
  }
}
