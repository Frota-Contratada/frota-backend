import { PhotonClienteService } from '@integration/geocodificacao/services/photon-cliente.service';
import { TomTomClienteService } from '@integration/geocodificacao/services/tomtom-cliente.service';
import { ViaCepClienteService } from '@integration/geocodificacao/services/viacep-cliente.service';
import { BuscarSugestoesEnderecoService } from './buscar-sugestoes-endereco.service';

describe('BuscarSugestoesEnderecoService', () => {
  const endereco = {
    descricao: 'Avenida Higienópolis, 100, Centro, Londrina, PR',
    latitude: -23.31,
    longitude: -51.16,
    cidade: 'Londrina',
    uf: 'PR',
  };

  const criar = (dependencias: {
    tomTom?: Partial<TomTomClienteService>;
    photon?: Partial<PhotonClienteService>;
    viaCep?: Partial<ViaCepClienteService>;
  }) =>
    new BuscarSugestoesEnderecoService(
      { configurado: true, ...dependencias.tomTom } as TomTomClienteService,
      (dependencias.photon ?? {}) as PhotonClienteService,
      (dependencias.viaCep ?? {}) as ViaCepClienteService,
    );

  it('retorna as sugestões do TomTom', async () => {
    const buscarEnderecos = jest.fn().mockResolvedValue([endereco]);

    const sugestoes = await criar({ tomTom: { buscarEnderecos } }).execute(
      'Avenida Higienópolis',
    );

    expect(sugestoes).toEqual([endereco]);
    expect(buscarEnderecos).toHaveBeenCalledWith(
      'Avenida Higienópolis',
      6,
      undefined,
    );
  });

  it('recorre ao Photon quando o TomTom falha', async () => {
    const sugestoes = await criar({
      tomTom: {
        buscarEnderecos: jest.fn().mockRejectedValue(new Error('falha')),
      },
      photon: { buscarEnderecos: jest.fn().mockResolvedValue([endereco]) },
    }).execute('Avenida Higienópolis');

    expect(sugestoes).toEqual([endereco]);
  });

  it('localiza o endereço do CEP informado', async () => {
    const sugestoes = await criar({
      tomTom: { buscarEnderecos: jest.fn().mockResolvedValue([endereco]) },
      viaCep: {
        buscar: jest.fn().mockResolvedValue({
          cep: '86020080',
          logradouro: 'Avenida Higienópolis',
          bairro: 'Centro',
          cidade: 'Londrina',
          uf: 'PR',
        }),
      },
    }).execute('86020-080');

    expect(sugestoes).toEqual([
      {
        descricao: 'Avenida Higienópolis, Centro, Londrina, PR',
        latitude: endereco.latitude,
        longitude: endereco.longitude,
        logradouro: 'Avenida Higienópolis',
        bairro: 'Centro',
        cidade: 'Londrina',
        uf: 'PR',
        cep: '86020080',
      },
    ]);
  });

  it('retorna lista vazia quando nenhum provedor responde', async () => {
    const sugestoes = await criar({
      tomTom: {
        buscarEnderecos: jest.fn().mockRejectedValue(new Error('falha')),
      },
      photon: {
        buscarEnderecos: jest.fn().mockRejectedValue(new Error('falha')),
      },
    }).execute('Rua inexistente');

    expect(sugestoes).toEqual([]);
  });
});
