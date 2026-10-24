import { Injectable, Logger } from '@nestjs/common';
import {
  EnderecoEncontrado,
  PontoGeografico,
} from '@integration/geocodificacao/interfaces/endereco-encontrado.interface';
import { PhotonClienteService } from '@integration/geocodificacao/services/photon-cliente.service';
import { TomTomClienteService } from '@integration/geocodificacao/services/tomtom-cliente.service';
import { ViaCepClienteService } from '@integration/geocodificacao/services/viacep-cliente.service';

const LIMITE_SUGESTOES = 6;
const TAMANHO_CEP = 8;

@Injectable()
export class BuscarSugestoesEnderecoService {
  private readonly logger = new Logger(BuscarSugestoesEnderecoService.name);

  constructor(
    private readonly tomTom: TomTomClienteService,
    private readonly photon: PhotonClienteService,
    private readonly viaCep: ViaCepClienteService,
  ) {}

  async execute(
    busca: string,
    proximoDe?: PontoGeografico,
  ): Promise<EnderecoEncontrado[]> {
    const texto = busca.trim();
    const cep = texto.replace(/\D/g, '');
    if (cep.length === TAMANHO_CEP && /^[\d\s.-]+$/.test(texto)) {
      const doCep = await this.buscarPorCep(cep);
      if (doCep != null) return [doCep];
    }
    return this.buscarPorTexto(texto, LIMITE_SUGESTOES, proximoDe);
  }

  private async buscarPorTexto(
    texto: string,
    limite: number,
    proximoDe?: PontoGeografico,
  ): Promise<EnderecoEncontrado[]> {
    if (this.tomTom.configurado) {
      try {
        const encontrados = await this.tomTom.buscarEnderecos(
          texto,
          limite,
          proximoDe,
        );
        if (encontrados.length > 0) return encontrados;
      } catch {
        this.logger.warn('Busca de endereços no TomTom indisponível.');
      }
    }

    try {
      return await this.photon.buscarEnderecos(texto, limite, proximoDe);
    } catch {
      this.logger.warn('Busca de endereços no Photon indisponível.');
      return [];
    }
  }

  private async buscarPorCep(
    cep: string,
  ): Promise<EnderecoEncontrado | undefined> {
    let endereco: Awaited<ReturnType<ViaCepClienteService['buscar']>>;
    try {
      endereco = await this.viaCep.buscar(cep);
    } catch {
      this.logger.warn('Consulta de CEP indisponível.');
      return undefined;
    }
    if (endereco == null) return undefined;

    const descricao = [
      endereco.logradouro,
      endereco.bairro,
      endereco.cidade,
      endereco.uf,
    ]
      .filter(Boolean)
      .join(', ');
    const [posicao] = await this.buscarPorTexto(`${descricao}, Brasil`, 1);
    if (posicao == null) return undefined;

    return {
      descricao,
      latitude: posicao.latitude,
      longitude: posicao.longitude,
      logradouro: endereco.logradouro,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      uf: endereco.uf,
      cep: endereco.cep,
    };
  }
}
