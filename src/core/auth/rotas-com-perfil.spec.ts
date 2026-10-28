import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { METHOD_METADATA } from '@nestjs/common/constants';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { PERFIS_KEY } from './decorators/perfis.decorator';

type Rota = {
  nome: string;
  publica: boolean;
  perfis?: TipoPerfil[];
};

// O PerfilGuard deixa passar qualquer usuário logado quando a rota não declara
// @Perfis. Só estas rotas ficam assim de propósito: cada uma devolve apenas
// dados do próprio usuário ou confere, no serviço, o vínculo com a corrida.
const ROTAS_SEM_PERFIL = [
  // filtra pelo usuário logado
  'BuscarCentrosCustoController.handle',
  'UsuarioAtualController.handle',
  'AtualizarFotoPerfilController.handle',
  'AtualizarPreferenciasNotificacaoController.handle',
  'BuscarPreferenciasNotificacaoController.handle',
  'ContarNotificacoesNaoLidasController.handle',
  'ListarNotificacoesController.handle',
  'MarcarNotificacaoComoLidaController.handle',
  // catálogos dos formulários, iguais para todos os perfis
  'BuscarCatalogosController.buscarMotivos',
  'BuscarCatalogosController.buscarTiposCorrida',
  'BuscarCatalogosController.buscarTiposVeiculo',
  // TrackingService confere motorista, passageiro, aprovador ou admin da corrida
  'BuscarTrackingController.handle',
  'ConcluirParadaController.handle',
  'FinalizarCorridaController.handle',
  'IniciarEsperaController.handle',
  'LancarDespesaCorridaController.handle',
  'RecalcularRotaController.handle',
  'RetomarCorridaController.handle',
  'SalvarPosicaoPassageiroController.handle',
  'SalvarPosicoesVeiculoController.handle',
];

const { ADMIN_MASTER, ADMIN_FILIAL, ADMIN_FORNECEDOR, APROVADOR } = TipoPerfil;

const PERFIS_ESPERADOS: Record<string, TipoPerfil[]> = {
  'CriarFilialController.handle': [ADMIN_MASTER],
  'AtualizarFilialController.handle': [ADMIN_MASTER],
  'SubstituirAdministradoresController.handle': [ADMIN_MASTER],
  'BuscarVariasFiliaisController.handle': [
    ADMIN_MASTER,
    ADMIN_FILIAL,
    APROVADOR,
  ],
  'BuscarFilialController.buscar': [ADMIN_MASTER, ADMIN_FILIAL],
  'CriarFornecedorController.handle': [ADMIN_MASTER],
  'BuscarFornecedorController.buscar': [ADMIN_MASTER, ADMIN_FILIAL],
  'CriarMotoristaController.handle': [
    ADMIN_MASTER,
    ADMIN_FILIAL,
    ADMIN_FORNECEDOR,
  ],
  'BuscarMotoristaController.buscarVarios': [
    ADMIN_MASTER,
    ADMIN_FILIAL,
    ADMIN_FORNECEDOR,
  ],
  'BuscarMotoristaController.buscar': [
    ADMIN_MASTER,
    ADMIN_FILIAL,
    ADMIN_FORNECEDOR,
  ],
  'BuscarEmpresaController.buscar': [ADMIN_MASTER, ADMIN_FILIAL],
  'BuscarPerfisDoColaboradorController.handle': [ADMIN_MASTER, ADMIN_FILIAL],
};

function arquivosDeController(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) return arquivosDeController(caminho);
    return nome.endsWith('.controller.ts') ? [caminho] : [];
  });
}

function carregarRotas(): Rota[] {
  const rotas: Rota[] = [];

  for (const arquivo of arquivosDeController(
    join(__dirname, '../../modules'),
  )) {
    const exportados = jest.requireActual<Record<string, unknown>>(arquivo);

    for (const exportado of Object.values(exportados)) {
      if (typeof exportado !== 'function') continue;
      const prototipo = exportado.prototype as Record<string, unknown>;
      const perfisDaClasse = Reflect.getMetadata(PERFIS_KEY, exportado) as
        | TipoPerfil[]
        | undefined;
      const classePublica = Reflect.getMetadata(IS_PUBLIC_KEY, exportado) as
        | boolean
        | undefined;

      for (const metodo of Object.getOwnPropertyNames(prototipo)) {
        const handler = prototipo[metodo];
        if (metodo === 'constructor' || typeof handler !== 'function') continue;
        if (Reflect.getMetadata(METHOD_METADATA, handler) === undefined) {
          continue;
        }

        rotas.push({
          nome: `${exportado.name}.${metodo}`,
          publica:
            classePublica === true ||
            Reflect.getMetadata(IS_PUBLIC_KEY, handler) === true,
          perfis:
            (Reflect.getMetadata(PERFIS_KEY, handler) as
              | TipoPerfil[]
              | undefined) ?? perfisDaClasse,
        });
      }
    }
  }

  return rotas;
}

describe('Perfis das rotas', () => {
  let rotas: Rota[];

  beforeAll(() => {
    rotas = carregarRotas();
  });

  it('encontra as rotas dos controllers', () => {
    expect(rotas.length).toBeGreaterThan(100);
  });

  it('exige @Perfis em toda rota autenticada fora da lista de exceções', () => {
    const semPerfil = rotas
      .filter((rota) => !rota.publica && !rota.perfis?.length)
      .map((rota) => rota.nome)
      .sort();

    expect(semPerfil).toEqual([...ROTAS_SEM_PERFIL].sort());
  });

  it.each(Object.entries(PERFIS_ESPERADOS))(
    '%s aceita só os perfis previstos',
    (nome, esperados) => {
      const rota = rotas.find((r) => r.nome === nome);

      expect(rota?.perfis).toEqual(esperados);
    },
  );
});
