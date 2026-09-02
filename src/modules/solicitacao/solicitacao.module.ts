import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { RotaModule } from '@core/rota/rota.module';
import { CentroDeCustoModule } from '@module/centro-de-custo/centro-de-custo.module';
import { UsuarioInfoModule } from '@module/usuario/info/usuario-info.module';
import { ColaboradorModule } from '@module/usuario/colaborador/colaborador.module';
import { BuscarCatalogosController } from './controllers/buscar-catalogos.controller';
import { BuscarViagensAgendadasController } from './controllers/buscar-viagens-agendadas.controller';
import { CriarSolicitacaoController } from './controllers/criar-solicitacao.controller';
import { SimularSolicitacaoController } from './controllers/simular-solicitacao.controller';
import { CancelarSolicitacaoController } from './controllers/cancelar-solicitacao.controller';
import { DecidirSolicitacaoFornecedorController } from './controllers/decidir-solicitacao-fornecedor.controller';
import { BuscarSolicitacaoController } from './controllers/buscar-solicitacao.controller';
import { BuscarSolicitacoesAprovadorController } from './controllers/buscar-solicitacoes-aprovador.controller';
import { BuscarMotivosService } from './services/buscar-motivos.service';
import { BuscarSolicitacaoService } from './services/buscar-solicitacao.service';
import { BuscarTiposCorridaService } from './services/buscar-tipos-corrida.service';
import { BuscarTiposVeiculoService } from './services/buscar-tipos-veiculo.service';
import { BuscarVariasSolicitacoesService } from './services/buscar-varias-solicitacoes.service';
import { BuscarSolicitacoesParaAprovacaoService } from './services/buscar-solicitacoes-para-aprovacao.service';
import { BuscarViagensAgendadasService } from './services/buscar-viagens-agendadas.service';
import { CalcularValorEstimadoService } from './services/calcular-valor-estimado.service';
import { CancelarSolicitacaoService } from './services/cancelar-solicitacao.service';
import { DecidirSolicitacaoFornecedorService } from './services/decidir-solicitacao-fornecedor.service';
import { CriarSolicitacaoService } from './services/criar-solicitacao.service';
import { SimularSolicitacaoService } from './services/simular-solicitacao.service';
import { SelecionarFornecedorService } from './services/selecionar-fornecedor.service';
import { CatalogoSolicitacaoRepositoryContract } from './repositories/catalogo-solicitacao-repository.contract';
import { ContratoPrecificacaoRepositoryContract } from './repositories/contrato-precificacao-repository.contract';
import { SolicitacaoRepositoryContract } from './repositories/solicitacao-repository.contract';
import { PrismaCatalogoSolicitacaoRepository } from './repositories/prisma-catalogo-solicitacao.repository';
import { PrismaContratoPrecificacaoRepository } from './repositories/prisma-contrato-precificacao.repository';
import { PrismaSolicitacaoRepository } from './repositories/prisma-solicitacao.repository';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RotaModule,
    UsuarioInfoModule,
    ColaboradorModule,
    CentroDeCustoModule,
  ],

  controllers: [
    BuscarCatalogosController,
    BuscarViagensAgendadasController,
    SimularSolicitacaoController,
    CriarSolicitacaoController,
    CancelarSolicitacaoController,
    DecidirSolicitacaoFornecedorController,
    BuscarSolicitacoesAprovadorController,
    BuscarSolicitacaoController,
  ],
  providers: [
    CriarSolicitacaoService,
    SimularSolicitacaoService,
    BuscarSolicitacaoService,
    BuscarVariasSolicitacoesService,
    BuscarSolicitacoesParaAprovacaoService,
    BuscarViagensAgendadasService,
    CancelarSolicitacaoService,
    DecidirSolicitacaoFornecedorService,
    CalcularValorEstimadoService,
    SelecionarFornecedorService,
    BuscarMotivosService,
    BuscarTiposCorridaService,
    BuscarTiposVeiculoService,
    {
      provide: SolicitacaoRepositoryContract,
      useClass: PrismaSolicitacaoRepository,
    },
    {
      provide: CatalogoSolicitacaoRepositoryContract,
      useClass: PrismaCatalogoSolicitacaoRepository,
    },
    {
      provide: ContratoPrecificacaoRepositoryContract,
      useClass: PrismaContratoPrecificacaoRepository,
    },
  ],
  exports: [SolicitacaoRepositoryContract],
})
export class SolicitacaoModule {}
