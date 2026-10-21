import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { RotaModule } from '@core/rota/rota.module';
import { CentroDeCustoModule } from '@module/centro-de-custo/centro-de-custo.module';
import { MotivoModule } from '@module/motivo/motivo.module';
import { NotificacaoModule } from '@module/notificacao/notificacao.module';
import { ColaboradorModule } from '@module/usuario/colaborador/colaborador.module';
import { TrackingModule } from '@module/tracking/tracking.module';
import { UsuarioInfoModule } from '@module/usuario/info/usuario-info.module';
import { BuscarCatalogosController } from './controllers/buscar-catalogos.controller';
import { BuscarFornecedoresCandidatosController } from './controllers/buscar-fornecedores-candidatos.controller';
import { BuscarSolicitacaoController } from './controllers/buscar-solicitacao.controller';
import { BuscarViagensAgendadasController } from './controllers/buscar-viagens-agendadas.controller';
import { CancelarSolicitacaoController } from './controllers/cancelar-solicitacao.controller';
import { CriarSolicitacaoController } from './controllers/criar-solicitacao.controller';
import { DecidirSolicitacaoFornecedorController } from './controllers/decidir-solicitacao-fornecedor.controller';
import { DecidirSolicitacaoAprovadorController } from './controllers/decidir-solicitacao-aprovador.controller';
import { BuscarSolicitacoesAprovadorController } from './controllers/buscar-solicitacoes-aprovador.controller';
import { SimularSolicitacaoController } from './controllers/simular-solicitacao.controller';
import { CalcularRotaController } from './controllers/calcular-rota.controller';
import { BuscarSugestoesEnderecoController } from './controllers/buscar-sugestoes-endereco.controller';
import { GeocodificacaoModule } from '@integration/geocodificacao/geocodificacao.module';
import { CalcularRotaSolicitacaoService } from './services/calcular-rota-solicitacao.service';
import { BuscarSugestoesEnderecoService } from './services/buscar-sugestoes-endereco.service';
import { CatalogoSolicitacaoRepositoryContract } from './repositories/catalogo-solicitacao-repository.contract';
import { ContratoPrecificacaoRepositoryContract } from './repositories/contrato-precificacao-repository.contract';
import { PrismaCatalogoSolicitacaoRepository } from './repositories/prisma-catalogo-solicitacao.repository';
import { PrismaContratoPrecificacaoRepository } from './repositories/prisma-contrato-precificacao.repository';
import { PrismaSolicitacaoRepository } from './repositories/prisma-solicitacao.repository';
import { SolicitacaoRepositoryContract } from './repositories/solicitacao-repository.contract';
import { BuscarFornecedoresCandidatosService } from './services/buscar-fornecedores-candidatos.service';
import { BuscarSolicitacaoService } from './services/buscar-solicitacao.service';
import { BuscarTiposCorridaService } from './services/buscar-tipos-corrida.service';
import { BuscarTiposVeiculoService } from './services/buscar-tipos-veiculo.service';
import { BuscarVariasSolicitacoesService } from './services/buscar-varias-solicitacoes.service';
import { BuscarSolicitacoesParaAprovacaoService } from './services/buscar-solicitacoes-para-aprovacao.service';
import { BuscarViagensAgendadasService } from './services/buscar-viagens-agendadas.service';
import { CalcularValorEstimadoService } from './services/calcular-valor-estimado.service';
import { CancelarSolicitacaoService } from './services/cancelar-solicitacao.service';
import { CriarCorridaService } from './services/criar-corrida.service';
import { CriarSolicitacaoService } from './services/criar-solicitacao.service';
import { DecidirSolicitacaoFornecedorService } from './services/decidir-solicitacao-fornecedor.service';
import { DecidirSolicitacaoAprovadorService } from './services/decidir-solicitacao-aprovador.service';
import { SelecionarFornecedorService } from './services/selecionar-fornecedor.service';
import { SimularSolicitacaoService } from './services/simular-solicitacao.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RotaModule,
    GeocodificacaoModule,
    UsuarioInfoModule,
    ColaboradorModule,
    CentroDeCustoModule,
    MotivoModule,
    NotificacaoModule,
    TrackingModule,
  ],
  controllers: [
    BuscarCatalogosController,
    CalcularRotaController,
    BuscarSugestoesEnderecoController,
    BuscarViagensAgendadasController,
    SimularSolicitacaoController,
    CriarSolicitacaoController,
    CancelarSolicitacaoController,
    DecidirSolicitacaoFornecedorController,
    DecidirSolicitacaoAprovadorController,
    BuscarSolicitacoesAprovadorController,
    BuscarFornecedoresCandidatosController,
    BuscarSolicitacaoController,
  ],
  providers: [
    CriarSolicitacaoService,
    SimularSolicitacaoService,
    CalcularRotaSolicitacaoService,
    BuscarSugestoesEnderecoService,
    BuscarSolicitacaoService,
    BuscarVariasSolicitacoesService,
    BuscarSolicitacoesParaAprovacaoService,
    BuscarFornecedoresCandidatosService,
    BuscarViagensAgendadasService,
    CancelarSolicitacaoService,
    DecidirSolicitacaoFornecedorService,
    DecidirSolicitacaoAprovadorService,
    CriarCorridaService,
    CalcularValorEstimadoService,
    SelecionarFornecedorService,
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
