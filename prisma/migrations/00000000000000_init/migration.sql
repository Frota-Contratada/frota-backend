BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[TipoToken] (
    [nCdTpToken] DECIMAL(10,0) NOT NULL,
    [cNmTpToken] VARCHAR(100) NOT NULL,
    [nQtdSegValidade] INT NOT NULL,
    CONSTRAINT [PK_TipoToken] PRIMARY KEY CLUSTERED ([nCdTpToken])
);

-- CreateTable
CREATE TABLE [dbo].[PinUsuario] (
    [nCdPinUsuario] BIGINT NOT NULL IDENTITY(1,1),
    [nCdUsuario] DECIMAL(10,0) NOT NULL,
    [nCdTpToken] DECIMAL(10,0) NOT NULL,
    [cPin] CHAR(6) NOT NULL,
    [cToken] VARCHAR(255),
    [cUtilizado] CHAR(1) NOT NULL CONSTRAINT [PinUsuario_cUtilizado_df] DEFAULT 'N',
    [dCriacao] DATETIME NOT NULL CONSTRAINT [DF_PinUsuario_dCriacao] DEFAULT CURRENT_TIMESTAMP,
    [dExpiracao] DATETIME NOT NULL,
    [dUtilizacao] DATETIME,
    CONSTRAINT [PK_PinUsuario] PRIMARY KEY CLUSTERED ([nCdPinUsuario])
);

-- CreateTable
CREATE TABLE [dbo].[CentroCusto] (
    [nCdFilial] DECIMAL(10,0) NOT NULL,
    [nCdCentroCusto] DECIMAL(10,0) NOT NULL,
    [cNmCentroCusto] VARCHAR(100) NOT NULL,
    [dAtivacao] DATETIME NOT NULL CONSTRAINT [DF_CentroCusto_dAtivacao] DEFAULT CURRENT_TIMESTAMP,
    [dDesativacao] DATETIME,
    CONSTRAINT [PK_CentroCusto] PRIMARY KEY CLUSTERED ([nCdFilial],[nCdCentroCusto])
);

-- CreateTable
CREATE TABLE [dbo].[CondicaoRegra] (
    [nCdContrato] DECIMAL(10,0) NOT NULL,
    [nCdRegra] DECIMAL(10,0) NOT NULL,
    [nCdCondicao] DECIMAL(10,0) NOT NULL,
    [cTipoCondicao] VARCHAR(50) NOT NULL,
    [cValor] NVARCHAR(max) NOT NULL,
    CONSTRAINT [PK_CondicaoRegra] PRIMARY KEY CLUSTERED ([nCdContrato],[nCdRegra],[nCdCondicao]),
    CONSTRAINT [UK_CondicaoRegra_Regra] UNIQUE NONCLUSTERED ([nCdContrato],[nCdRegra])
);

-- CreateTable
CREATE TABLE [dbo].[CondicaoRegraRotaFixa] (
    [nCdContrato] DECIMAL(10,0) NOT NULL,
    [nCdRegra] DECIMAL(10,0) NOT NULL,
    [nCdCondicao] DECIMAL(10,0) NOT NULL,
    [nCdRota] DECIMAL(10,0) NOT NULL,
    CONSTRAINT [PK_CondicaoRegraRotaFixa] PRIMARY KEY CLUSTERED ([nCdContrato],[nCdRegra],[nCdCondicao],[nCdRota])
);

-- CreateTable
CREATE TABLE [dbo].[CondicaoRegraOutro] (
    [nCdContrato] DECIMAL(10,0) NOT NULL,
    [nCdRegra] DECIMAL(10,0) NOT NULL,
    [nCdCondicao] DECIMAL(10,0) NOT NULL,
    [nCdPergunta] DECIMAL(10,0) NOT NULL,
    CONSTRAINT [PK_CondicaoRegraOutro] PRIMARY KEY CLUSTERED ([nCdContrato],[nCdRegra],[nCdCondicao])
);

-- CreateTable
CREATE TABLE [dbo].[Contrato] (
    [nCdContrato] DECIMAL(10,0) NOT NULL,
    [cCaminhoArquivo] VARCHAR(255) NOT NULL,
    [nCdUsuarioCadastro] DECIMAL(10,0) NOT NULL,
    [dVigenciaInicio] DATE NOT NULL,
    [dVigenciaFim] DATE,
    [dAlteracao] DATETIME NOT NULL CONSTRAINT [DF_Contrato_dAlteracao] DEFAULT CURRENT_TIMESTAMP,
    [cSituacao] VARCHAR(30) NOT NULL CONSTRAINT [DF_Contrato_cSituacao] DEFAULT 'rascunho',
    CONSTRAINT [PK_Contrato] PRIMARY KEY CLUSTERED ([nCdContrato])
);

-- CreateTable
CREATE TABLE [dbo].[Corrida] (
    [nCdCorrida] DECIMAL(10,0) NOT NULL,
    [nCdSolicitacao] DECIMAL(10,0) NOT NULL,
    [nCdMotorista] DECIMAL(10,0) NOT NULL,
    [nCdFornecedor] DECIMAL(10,0) NOT NULL,
    [nCdVeiculo] DECIMAL(10,0) NOT NULL,
    [dInicioCorrida] DATETIME NOT NULL,
    [dFimCorrida] DATETIME,
    [nKmPercorrido] DECIMAL(18,2) NOT NULL,
    [nValorFinal] DECIMAL(18,2) NOT NULL,
    [cStatus] CHAR(1) NOT NULL CONSTRAINT [DF_Corrida_cStatus] DEFAULT 'I',
    CONSTRAINT [PK_Corrida] PRIMARY KEY CLUSTERED ([nCdCorrida])
);

-- CreateTable
CREATE TABLE [dbo].[CorridaRota] (
    [nCdCorridaRota] BIGINT NOT NULL IDENTITY(1,1),
    [nCdCorrida] DECIMAL(10,0) NOT NULL,
    [iVersao] INT NOT NULL,
    [cRouteId] VARCHAR(36) NOT NULL,
    [cPayload] NVARCHAR(max) NOT NULL,
    [dCalculada] DATETIME2 NOT NULL CONSTRAINT [CorridaRota_dCalculada_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK_CorridaRota] PRIMARY KEY CLUSTERED ([nCdCorridaRota]),
    CONSTRAINT [UK_CorridaRota_CorridaVersao] UNIQUE NONCLUSTERED ([nCdCorrida],[iVersao]),
    CONSTRAINT [UK_CorridaRota_RouteId] UNIQUE NONCLUSTERED ([cRouteId])
);

-- CreateTable
CREATE TABLE [dbo].[CorridaPosicao] (
    [nCdCorridaPosicao] BIGINT NOT NULL IDENTITY(1,1),
    [nCdCorrida] DECIMAL(10,0) NOT NULL,
    [cOrigem] CHAR(1) NOT NULL,
    [nCdUsuario] DECIMAL(10,0),
    [nLatitude] DECIMAL(10,7) NOT NULL,
    [nLongitude] DECIMAL(10,7) NOT NULL,
    [nAccuracy] DECIMAL(10,3) NOT NULL,
    [nSpeed] DECIMAL(10,3) NOT NULL,
    [nHeading] DECIMAL(6,3) NOT NULL,
    [dPosicao] DATETIME2 NOT NULL,
    [dRecebida] DATETIME2 NOT NULL CONSTRAINT [CorridaPosicao_dRecebida_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK_CorridaPosicao] PRIMARY KEY CLUSTERED ([nCdCorridaPosicao]),
    CONSTRAINT [UK_CorridaPosicao_Deduplicacao] UNIQUE NONCLUSTERED ([nCdCorrida],[cOrigem],[nCdUsuario],[dPosicao])
);

-- CreateTable
CREATE TABLE [dbo].[CorridaEspera] (
    [nCdCorridaEspera] BIGINT NOT NULL IDENTITY(1,1),
    [nCdCorrida] DECIMAL(10,0) NOT NULL,
    [dInicio] DATETIME2 NOT NULL,
    [dFim] DATETIME2,
    CONSTRAINT [PK_CorridaEspera] PRIMARY KEY CLUSTERED ([nCdCorridaEspera])
);

-- CreateTable
CREATE TABLE [dbo].[CorridaParadaProgresso] (
    [nCdCorrida] DECIMAL(10,0) NOT NULL,
    [iOrdem] INT NOT NULL,
    [nCdUsuario] DECIMAL(10,0) NOT NULL,
    [dConcluida] DATETIME2 NOT NULL CONSTRAINT [CorridaParadaProgresso_dConcluida_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK_CorridaParadaProgresso] PRIMARY KEY CLUSTERED ([nCdCorrida],[iOrdem])
);

-- CreateTable
CREATE TABLE [dbo].[ComandoIdempotente] (
    [nCdComandoIdempotente] BIGINT NOT NULL IDENTITY(1,1),
    [nCdCorrida] DECIMAL(10,0) NOT NULL,
    [cChave] VARCHAR(36) NOT NULL,
    [cTipo] VARCHAR(30) NOT NULL,
    [cEstado] VARCHAR(15) NOT NULL,
    [cResultado] NVARCHAR(max),
    [dCriacao] DATETIME2 NOT NULL CONSTRAINT [ComandoIdempotente_dCriacao_df] DEFAULT CURRENT_TIMESTAMP,
    [dAtualizacao] DATETIME2 NOT NULL,
    CONSTRAINT [PK_ComandoIdempotente] PRIMARY KEY CLUSTERED ([nCdComandoIdempotente]),
    CONSTRAINT [UK_ComandoIdempotente_CorridaChave] UNIQUE NONCLUSTERED ([nCdCorrida],[cChave])
);

-- CreateTable
CREATE TABLE [dbo].[DespesaCorrida] (
    [nCdDespesa] DECIMAL(10,0) NOT NULL,
    [nCdCorrida] DECIMAL(10,0) NOT NULL,
    [cTipoDespesa] VARCHAR(50) NOT NULL,
    [nValorDespesa] DECIMAL(18,2) NOT NULL,
    [cCaminhoRecibo] VARCHAR(255),
    [dInclusao] DATETIME NOT NULL CONSTRAINT [DF_DespesaCorrida_dInclusao] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK_DespesaCorrida] PRIMARY KEY CLUSTERED ([nCdDespesa])
);

-- CreateTable
CREATE TABLE [dbo].[RecusaCorrida] (
    [nCdRecusaCorrida] DECIMAL(10,0) NOT NULL,
    [nCdCorrida] DECIMAL(10,0) NOT NULL,
    [nCdMotorista] DECIMAL(10,0) NOT NULL,
    [cMotivo] NVARCHAR(500) NOT NULL,
    [dRecusa] DATETIME NOT NULL CONSTRAINT [DF_RecusaCorrida_dRecusa] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK_RecusaCorrida] PRIMARY KEY CLUSTERED ([nCdRecusaCorrida])
);

-- CreateTable
CREATE TABLE [dbo].[Endereco] (
    [nCdEndereco] DECIMAL(10,0) NOT NULL,
    [cEndereco] VARCHAR(200) NOT NULL,
    [cNumero] VARCHAR(20) NOT NULL,
    [cComplemento] VARCHAR(100),
    [cBairro] VARCHAR(100) NOT NULL,
    [cCidade] VARCHAR(100) NOT NULL,
    [cUf] CHAR(2) NOT NULL,
    [cCEP] VARCHAR(10) NOT NULL,
    [nLatitude] DECIMAL(9,6) NOT NULL,
    [nLongitude] DECIMAL(9,6) NOT NULL,
    [dInclusao] DATETIME NOT NULL CONSTRAINT [DF_Endereco_dInclusao] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK_Endereco] PRIMARY KEY CLUSTERED ([nCdEndereco])
);

-- CreateTable
CREATE TABLE [dbo].[Filial] (
    [nCdFilial] DECIMAL(10,0) NOT NULL,
    [cNmFilial] VARCHAR(100) NOT NULL,
    [cCNPJ] VARCHAR(14) NOT NULL,
    [nCdEndereco] DECIMAL(10,0) NOT NULL,
    [dAtivacao] DATETIME NOT NULL CONSTRAINT [DF_Filial_dAtivacao] DEFAULT CURRENT_TIMESTAMP,
    [dDesativacao] DATETIME,
    CONSTRAINT [PK_Filial] PRIMARY KEY CLUSTERED ([nCdFilial]),
    CONSTRAINT [UK_Filial_cNmFilial] UNIQUE NONCLUSTERED ([cNmFilial]),
    CONSTRAINT [UK_Filial_cCNPJ] UNIQUE NONCLUSTERED ([cCNPJ])
);

-- CreateTable
CREATE TABLE [dbo].[FilialFornecedor] (
    [nCdFilial] DECIMAL(10,0) NOT NULL,
    [nCdFornecedor] DECIMAL(10,0) NOT NULL,
    [nCdContrato] DECIMAL(10,0) NOT NULL,
    CONSTRAINT [PK_FilialFornecedor] PRIMARY KEY CLUSTERED ([nCdFilial],[nCdFornecedor],[nCdContrato])
);

-- CreateTable
CREATE TABLE [dbo].[Fornecedor] (
    [nCdFornecedor] DECIMAL(10,0) NOT NULL,
    [cNmFornecedor] VARCHAR(100) NOT NULL,
    [cCNPJCPF] VARCHAR(14) NOT NULL,
    [cCaminhoArquivo] VARCHAR(255),
    [dAtivacao] DATETIME NOT NULL CONSTRAINT [DF_Fornecedor_dAtivacao] DEFAULT CURRENT_TIMESTAMP,
    [dDesativacao] DATETIME,
    CONSTRAINT [PK_Fornecedor] PRIMARY KEY CLUSTERED ([nCdFornecedor]),
    CONSTRAINT [UK_Fornecedor_cCNPJCPF] UNIQUE NONCLUSTERED ([cCNPJCPF])
);

-- CreateTable
CREATE TABLE [dbo].[ModalidadeContrato] (
    [nCdContrato] DECIMAL(10,0) NOT NULL,
    [nCdTipoCorrida] DECIMAL(10,0) NOT NULL,
    CONSTRAINT [PK_ModalidadeContrato] PRIMARY KEY CLUSTERED ([nCdContrato],[nCdTipoCorrida])
);

-- CreateTable
CREATE TABLE [dbo].[Motivo] (
    [nCdMotivo] DECIMAL(10,0) NOT NULL,
    [nCdFilial] DECIMAL(10,0),
    [cNmMotivo] VARCHAR(100) NOT NULL,
    [cTipoMotivo] VARCHAR(30) NOT NULL CONSTRAINT [DF_Motivo_cTipoMotivo] DEFAULT 'solicitacao',
    [dAtivacao] DATETIME NOT NULL CONSTRAINT [DF_Motivo_dAtivacao] DEFAULT CURRENT_TIMESTAMP,
    [dDesativacao] DATETIME,
    CONSTRAINT [PK_Motivo] PRIMARY KEY CLUSTERED ([nCdMotivo])
);

-- CreateTable
CREATE TABLE [dbo].[Parada] (
    [nCdSolicitacao] DECIMAL(10,0) NOT NULL,
    [iOrdem] INT NOT NULL,
    [nCdEndereco] DECIMAL(10,0) NOT NULL,
    [iTempoParadaMinutos] INT,
    CONSTRAINT [PK_Parada] PRIMARY KEY CLUSTERED ([nCdSolicitacao],[iOrdem])
);

-- CreateTable
CREATE TABLE [dbo].[Permissao] (
    [nCdPermissao] DECIMAL(10,0) NOT NULL,
    [cNmPermissao] VARCHAR(100) NOT NULL,
    CONSTRAINT [PK_Permissao] PRIMARY KEY CLUSTERED ([nCdPermissao])
);

-- CreateTable
CREATE TABLE [dbo].[Regra] (
    [nCdContrato] DECIMAL(10,0) NOT NULL,
    [nCdRegra] DECIMAL(10,0) NOT NULL,
    [iPrioridade] INT NOT NULL,
    [nCdTipoRegra] DECIMAL(10,0) NOT NULL,
    [nValorKm] DECIMAL(18,2),
    [nValorFixo] DECIMAL(18,2),
    [nPercentual] DECIMAL(5,2),
    CONSTRAINT [PK_Regra] PRIMARY KEY CLUSTERED ([nCdContrato],[nCdRegra])
);

-- CreateTable
CREATE TABLE [dbo].[RegraCorrida] (
    [nCdCorrida] DECIMAL(10,0) NOT NULL,
    [nCdContrato] DECIMAL(10,0) NOT NULL,
    [nCdRegra] DECIMAL(10,0) NOT NULL,
    [nValorCobrado] DECIMAL(18,2) NOT NULL,
    CONSTRAINT [PK_RegraCorrida] PRIMARY KEY CLUSTERED ([nCdCorrida],[nCdContrato],[nCdRegra])
);

-- CreateTable
CREATE TABLE [dbo].[Solicitacao] (
    [nCdSolicitacao] DECIMAL(10,0) NOT NULL,
    [nCdSolicitante] DECIMAL(10,0) NOT NULL,
    [nCdFornecedor] DECIMAL(10,0) NOT NULL,
    [nCdContrato] DECIMAL(10,0) NOT NULL,
    [dCriacao] DATETIME NOT NULL CONSTRAINT [DF_Solicitacao_dCriacao] DEFAULT CURRENT_TIMESTAMP,
    [dCorrida] DATETIME NOT NULL,
    [nDistanciaEstimada] DECIMAL(18,3) NOT NULL,
    [nCdTipoCorrida] DECIMAL(10,0) NOT NULL,
    [nCdEnderecoOrigem] DECIMAL(10,0) NOT NULL,
    [nCdEnderecoDestino] DECIMAL(10,0) NOT NULL,
    [nCdRotaFixa] DECIMAL(10,0),
    [nValorEstimado] DECIMAL(18,2) NOT NULL,
    [cStatus] CHAR(1) NOT NULL CONSTRAINT [DF_Solicitacao_cStatus] DEFAULT 'P',
    [nCdMotivoCancelamento] DECIMAL(10,0),
    [cMotivoRecusaFornecedor] NVARCHAR(500),
    [nCdMotivoSolicitacao] DECIMAL(10,0) NOT NULL,
    [nCdTpVeiculo] DECIMAL(10,0),
    CONSTRAINT [PK_Solicitacao] PRIMARY KEY CLUSTERED ([nCdSolicitacao])
);

-- CreateTable
CREATE TABLE [dbo].[SolicitacaoCentroCusto] (
    [nCdSolicitacao] DECIMAL(10,0) NOT NULL,
    [nCdFilial] DECIMAL(10,0) NOT NULL,
    [nCdCentroCusto] DECIMAL(10,0) NOT NULL,
    [nCdAprovador] DECIMAL(10,0) NOT NULL,
    [cStatusAprovacao] CHAR(1) NOT NULL CONSTRAINT [DF_SolCC_cStatus] DEFAULT 'P',
    [nCdMotivoRecusa] DECIMAL(10,0),
    CONSTRAINT [PK_SolicitacaoCentroCusto] PRIMARY KEY CLUSTERED ([nCdSolicitacao],[nCdFilial],[nCdCentroCusto])
);

-- CreateTable
CREATE TABLE [dbo].[SolicitacaoPassageiro] (
    [nCdSolicitacao] DECIMAL(10,0) NOT NULL,
    [cCPF] VARCHAR(11) NOT NULL,
    CONSTRAINT [PK_SolicitacaoPassageiro] PRIMARY KEY CLUSTERED ([nCdSolicitacao],[cCPF])
);

-- CreateTable
CREATE TABLE [dbo].[TipoCorrida] (
    [nCdTipoCorrida] DECIMAL(10,0) NOT NULL,
    [cNmTipoCorrida] VARCHAR(100) NOT NULL,
    CONSTRAINT [PK_TipoCorrida] PRIMARY KEY CLUSTERED ([nCdTipoCorrida])
);

-- CreateTable
CREATE TABLE [dbo].[TipoRegra] (
    [nCdTipoRegra] DECIMAL(10,0) NOT NULL,
    [cNmRegra] VARCHAR(100) NOT NULL,
    CONSTRAINT [PK_TipoRegra] PRIMARY KEY CLUSTERED ([nCdTipoRegra])
);

-- CreateTable
CREATE TABLE [dbo].[TipoVeiculo] (
    [nCdTpVeiculo] DECIMAL(10,0) NOT NULL,
    [cNmTpVeiculo] VARCHAR(100) NOT NULL,
    [iQntPassageiros] INT NOT NULL,
    CONSTRAINT [PK_TipoVeiculo] PRIMARY KEY CLUSTERED ([nCdTpVeiculo])
);

-- CreateTable
CREATE TABLE [dbo].[Usuario] (
    [nCdUsuario] DECIMAL(10,0) NOT NULL,
    [cNmUsuario] VARCHAR(100) NOT NULL,
    [nCdFilial] DECIMAL(10,0),
    [nCdFornecedor] DECIMAL(10,0),
    [nCdCentroCusto] DECIMAL(10,0),
    [cCdSeara] VARCHAR(255),
    [cCaminhoFotoPerfil] VARCHAR(255),
    [cEmail] VARCHAR(100) NOT NULL,
    [cCargo] VARCHAR(100),
    [cHashSenha] VARCHAR(255),
    [cCPF] VARCHAR(11),
    [cDisponivel] CHAR(1) NOT NULL,
    [dAtivacao] DATETIME NOT NULL CONSTRAINT [DF_Usuario_dAtivacao] DEFAULT CURRENT_TIMESTAMP,
    [dDesativacao] DATETIME,
    CONSTRAINT [PK_Usuario] PRIMARY KEY CLUSTERED ([nCdUsuario]),
    CONSTRAINT [UK_Usuario_cEmail] UNIQUE NONCLUSTERED ([cEmail]),
    CONSTRAINT [UK_Usuario_cCPF] UNIQUE NONCLUSTERED ([cCPF])
);

-- CreateTable
CREATE TABLE [dbo].[UsuarioPerfil] (
    [nCdUsuario] DECIMAL(10,0) NOT NULL,
    [cTipoPerfil] VARCHAR(30) NOT NULL,
    [dInicioVigencia] DATETIME NOT NULL,
    [dFimVigencia] DATETIME,
    CONSTRAINT [PK_UsuarioPerfil] PRIMARY KEY CLUSTERED ([nCdUsuario],[cTipoPerfil])
);

-- CreateTable
CREATE TABLE [dbo].[Veiculo] (
    [nCdVeiculo] DECIMAL(10,0) NOT NULL,
    [nCdFornecedor] DECIMAL(10,0) NOT NULL,
    [nCdTpVeiculo] DECIMAL(10,0) NOT NULL,
    [cPlaca] VARCHAR(7) NOT NULL,
    [dAtivacao] DATETIME NOT NULL CONSTRAINT [DF_Veiculo_dAtivacao] DEFAULT CURRENT_TIMESTAMP,
    [dDesativacao] DATETIME,
    CONSTRAINT [PK_Veiculo] PRIMARY KEY CLUSTERED ([nCdFornecedor],[nCdVeiculo]),
    CONSTRAINT [UK_Veiculo_cPlaca] UNIQUE NONCLUSTERED ([cPlaca])
);

-- CreateTable
CREATE TABLE [dbo].[RotaFixa] (
    [nCdContrato] DECIMAL(10,0) NOT NULL,
    [nCdRota] DECIMAL(10,0) NOT NULL,
    [nCdEnderecoOrigem] DECIMAL(10,0) NOT NULL,
    [nCdEnderecoDestino] DECIMAL(10,0) NOT NULL,
    CONSTRAINT [PK_RotaFixa] PRIMARY KEY CLUSTERED ([nCdContrato],[nCdRota])
);

-- CreateTable
CREATE TABLE [dbo].[PerguntaContrato] (
    [nCdContrato] DECIMAL(10,0) NOT NULL,
    [nCdPergunta] DECIMAL(10,0) NOT NULL,
    [cPergunta] VARCHAR(255) NOT NULL,
    CONSTRAINT [PK_PerguntaContrato] PRIMARY KEY CLUSTERED ([nCdContrato],[nCdPergunta])
);

-- CreateTable
CREATE TABLE [dbo].[SolicitacaoResposta] (
    [nCdSolicitacao] DECIMAL(10,0) NOT NULL,
    [nCdContrato] DECIMAL(10,0) NOT NULL,
    [nCdPergunta] DECIMAL(10,0) NOT NULL,
    [cResposta] CHAR(1) NOT NULL,
    CONSTRAINT [PK_SolicitacaoResposta] PRIMARY KEY CLUSTERED ([nCdSolicitacao],[nCdContrato],[nCdPergunta])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_PinUsuario_BuscaAtivoPorPin] ON [dbo].[PinUsuario]([nCdUsuario], [nCdTpToken], [cUtilizado]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_PinUsuario_BuscaAtivoPorToken] ON [dbo].[PinUsuario]([cToken], [cUtilizado]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_CondicaoRegraRotaFixa_Rota] ON [dbo].[CondicaoRegraRotaFixa]([nCdContrato], [nCdRota]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_CondicaoRegraOutro_Pergunta] ON [dbo].[CondicaoRegraOutro]([nCdContrato], [nCdPergunta]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Corrida_FiltroDash] ON [dbo].[Corrida]([dInicioCorrida] DESC, [cStatus]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Corrida_nCdSolicitacao] ON [dbo].[Corrida]([nCdSolicitacao]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_CorridaRota_Ultima] ON [dbo].[CorridaRota]([nCdCorrida], [dCalculada] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_CorridaPosicao_Historico] ON [dbo].[CorridaPosicao]([nCdCorrida], [dPosicao] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_CorridaPosicao_Ultima] ON [dbo].[CorridaPosicao]([nCdCorrida], [cOrigem], [nCdUsuario], [dPosicao] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_CorridaEspera_Ultima] ON [dbo].[CorridaEspera]([nCdCorrida], [dInicio] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_CorridaEspera_Ativa] ON [dbo].[CorridaEspera]([nCdCorrida], [dFim]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_CorridaParadaProgresso_Consulta] ON [dbo].[CorridaParadaProgresso]([nCdCorrida], [dConcluida]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_ComandoIdempotente_Consulta] ON [dbo].[ComandoIdempotente]([nCdCorrida], [dCriacao] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_RecusaCorrida_Corrida] ON [dbo].[RecusaCorrida]([nCdCorrida], [dRecusa]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_RecusaCorrida_Motorista] ON [dbo].[RecusaCorrida]([nCdMotorista], [dRecusa]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Endereco_Busca] ON [dbo].[Endereco]([cCidade], [cEndereco]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Motivo_EscopoTipo] ON [dbo].[Motivo]([nCdFilial], [cTipoMotivo], [dDesativacao]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Parada_nCdSolicitacao] ON [dbo].[Parada]([nCdSolicitacao]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Solicitacao_FiltroDash] ON [dbo].[Solicitacao]([dCriacao] DESC, [cStatus]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Solicitacao_OrigemDest] ON [dbo].[Solicitacao]([nCdEnderecoOrigem], [nCdEnderecoDestino]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Solicitacao_nCdContrato] ON [dbo].[Solicitacao]([nCdContrato]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Usuario_LoginRumo] ON [dbo].[Usuario]([cEmail], [cDisponivel]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Usuario_CentroCusto] ON [dbo].[Usuario]([nCdFilial], [nCdCentroCusto]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_UsuarioPerfil_cTipoPerfil] ON [dbo].[UsuarioPerfil]([cTipoPerfil]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Veiculo_nCdFornecedor] ON [dbo].[Veiculo]([nCdFornecedor]);

-- AddForeignKey
ALTER TABLE [dbo].[PinUsuario] ADD CONSTRAINT [FK_PinUsuario_Usuario] FOREIGN KEY ([nCdUsuario]) REFERENCES [dbo].[Usuario]([nCdUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PinUsuario] ADD CONSTRAINT [FK_PinUsuario_TipoToken] FOREIGN KEY ([nCdTpToken]) REFERENCES [dbo].[TipoToken]([nCdTpToken]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CentroCusto] ADD CONSTRAINT [FK_CentroCusto_Filial] FOREIGN KEY ([nCdFilial]) REFERENCES [dbo].[Filial]([nCdFilial]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CondicaoRegra] ADD CONSTRAINT [FK_CondicaoRegra_Regra] FOREIGN KEY ([nCdContrato], [nCdRegra]) REFERENCES [dbo].[Regra]([nCdContrato],[nCdRegra]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CondicaoRegraRotaFixa] ADD CONSTRAINT [FK_CondicaoRegraRotaFixa_CondicaoRegra] FOREIGN KEY ([nCdContrato], [nCdRegra], [nCdCondicao]) REFERENCES [dbo].[CondicaoRegra]([nCdContrato],[nCdRegra],[nCdCondicao]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CondicaoRegraRotaFixa] ADD CONSTRAINT [FK_CondicaoRegraRotaFixa_RotaFixa] FOREIGN KEY ([nCdContrato], [nCdRota]) REFERENCES [dbo].[RotaFixa]([nCdContrato],[nCdRota]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CondicaoRegraOutro] ADD CONSTRAINT [FK_CondicaoRegraOutro_CondicaoRegra] FOREIGN KEY ([nCdContrato], [nCdRegra], [nCdCondicao]) REFERENCES [dbo].[CondicaoRegra]([nCdContrato],[nCdRegra],[nCdCondicao]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CondicaoRegraOutro] ADD CONSTRAINT [FK_CondicaoRegraOutro_PerguntaContrato] FOREIGN KEY ([nCdContrato], [nCdPergunta]) REFERENCES [dbo].[PerguntaContrato]([nCdContrato],[nCdPergunta]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Contrato] ADD CONSTRAINT [FK_Contrato_Usuario] FOREIGN KEY ([nCdUsuarioCadastro]) REFERENCES [dbo].[Usuario]([nCdUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Corrida] ADD CONSTRAINT [FK_Corrida_Motorista] FOREIGN KEY ([nCdMotorista]) REFERENCES [dbo].[Usuario]([nCdUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Corrida] ADD CONSTRAINT [FK_Corrida_Solicitacao] FOREIGN KEY ([nCdSolicitacao]) REFERENCES [dbo].[Solicitacao]([nCdSolicitacao]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Corrida] ADD CONSTRAINT [FK_Corrida_Veiculo] FOREIGN KEY ([nCdFornecedor], [nCdVeiculo]) REFERENCES [dbo].[Veiculo]([nCdFornecedor],[nCdVeiculo]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CorridaRota] ADD CONSTRAINT [FK_CorridaRota_Corrida] FOREIGN KEY ([nCdCorrida]) REFERENCES [dbo].[Corrida]([nCdCorrida]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CorridaPosicao] ADD CONSTRAINT [FK_CorridaPosicao_Corrida] FOREIGN KEY ([nCdCorrida]) REFERENCES [dbo].[Corrida]([nCdCorrida]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CorridaPosicao] ADD CONSTRAINT [FK_CorridaPosicao_Usuario] FOREIGN KEY ([nCdUsuario]) REFERENCES [dbo].[Usuario]([nCdUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CorridaEspera] ADD CONSTRAINT [FK_CorridaEspera_Corrida] FOREIGN KEY ([nCdCorrida]) REFERENCES [dbo].[Corrida]([nCdCorrida]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CorridaParadaProgresso] ADD CONSTRAINT [FK_CorridaParadaProgresso_Corrida] FOREIGN KEY ([nCdCorrida]) REFERENCES [dbo].[Corrida]([nCdCorrida]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ComandoIdempotente] ADD CONSTRAINT [FK_ComandoIdempotente_Corrida] FOREIGN KEY ([nCdCorrida]) REFERENCES [dbo].[Corrida]([nCdCorrida]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DespesaCorrida] ADD CONSTRAINT [FK_DespesaCorrida_Corrida] FOREIGN KEY ([nCdCorrida]) REFERENCES [dbo].[Corrida]([nCdCorrida]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RecusaCorrida] ADD CONSTRAINT [FK_RecusaCorrida_Corrida] FOREIGN KEY ([nCdCorrida]) REFERENCES [dbo].[Corrida]([nCdCorrida]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RecusaCorrida] ADD CONSTRAINT [FK_RecusaCorrida_Motorista] FOREIGN KEY ([nCdMotorista]) REFERENCES [dbo].[Usuario]([nCdUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Filial] ADD CONSTRAINT [FK_Filial_Endereco] FOREIGN KEY ([nCdEndereco]) REFERENCES [dbo].[Endereco]([nCdEndereco]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FilialFornecedor] ADD CONSTRAINT [FK_FilialFornecedor_Contrato] FOREIGN KEY ([nCdContrato]) REFERENCES [dbo].[Contrato]([nCdContrato]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FilialFornecedor] ADD CONSTRAINT [FK_FilialFornecedor_Filial] FOREIGN KEY ([nCdFilial]) REFERENCES [dbo].[Filial]([nCdFilial]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FilialFornecedor] ADD CONSTRAINT [FK_FilialFornecedor_Fornecedor] FOREIGN KEY ([nCdFornecedor]) REFERENCES [dbo].[Fornecedor]([nCdFornecedor]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ModalidadeContrato] ADD CONSTRAINT [FK_ModalidadeContrato_Contrato] FOREIGN KEY ([nCdContrato]) REFERENCES [dbo].[Contrato]([nCdContrato]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ModalidadeContrato] ADD CONSTRAINT [FK_ModalidadeContrato_TipoCorrida] FOREIGN KEY ([nCdTipoCorrida]) REFERENCES [dbo].[TipoCorrida]([nCdTipoCorrida]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Motivo] ADD CONSTRAINT [FK_Motivo_Filial] FOREIGN KEY ([nCdFilial]) REFERENCES [dbo].[Filial]([nCdFilial]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Parada] ADD CONSTRAINT [FK_Parada_Endereco] FOREIGN KEY ([nCdEndereco]) REFERENCES [dbo].[Endereco]([nCdEndereco]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Parada] ADD CONSTRAINT [FK_Parada_Solicitacao] FOREIGN KEY ([nCdSolicitacao]) REFERENCES [dbo].[Solicitacao]([nCdSolicitacao]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Regra] ADD CONSTRAINT [FK_ContratoRegra_TipoRegra] FOREIGN KEY ([nCdTipoRegra]) REFERENCES [dbo].[TipoRegra]([nCdTipoRegra]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Regra] ADD CONSTRAINT [FK_Regra_Contrato] FOREIGN KEY ([nCdContrato]) REFERENCES [dbo].[Contrato]([nCdContrato]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RegraCorrida] ADD CONSTRAINT [FK_RegraCorrida_Corrida] FOREIGN KEY ([nCdCorrida]) REFERENCES [dbo].[Corrida]([nCdCorrida]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RegraCorrida] ADD CONSTRAINT [FK_RegraCorrida_Regra] FOREIGN KEY ([nCdContrato], [nCdRegra]) REFERENCES [dbo].[Regra]([nCdContrato],[nCdRegra]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Solicitacao] ADD CONSTRAINT [FK_Solicitacao_Contrato] FOREIGN KEY ([nCdContrato]) REFERENCES [dbo].[Contrato]([nCdContrato]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Solicitacao] ADD CONSTRAINT [FK_Solicitacao_Destino] FOREIGN KEY ([nCdEnderecoDestino]) REFERENCES [dbo].[Endereco]([nCdEndereco]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Solicitacao] ADD CONSTRAINT [FK_Solicitacao_Fornecedor] FOREIGN KEY ([nCdFornecedor]) REFERENCES [dbo].[Fornecedor]([nCdFornecedor]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Solicitacao] ADD CONSTRAINT [FK_Solicitacao_RotaFixa] FOREIGN KEY ([nCdContrato], [nCdRotaFixa]) REFERENCES [dbo].[RotaFixa]([nCdContrato],[nCdRota]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Solicitacao] ADD CONSTRAINT [FK_Solicitacao_MotivoCancelamento] FOREIGN KEY ([nCdMotivoCancelamento]) REFERENCES [dbo].[Motivo]([nCdMotivo]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Solicitacao] ADD CONSTRAINT [FK_Solicitacao_MotivoSolicitacao] FOREIGN KEY ([nCdMotivoSolicitacao]) REFERENCES [dbo].[Motivo]([nCdMotivo]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Solicitacao] ADD CONSTRAINT [FK_Solicitacao_Origem] FOREIGN KEY ([nCdEnderecoOrigem]) REFERENCES [dbo].[Endereco]([nCdEndereco]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Solicitacao] ADD CONSTRAINT [FK_Solicitacao_Solicitante] FOREIGN KEY ([nCdSolicitante]) REFERENCES [dbo].[Usuario]([nCdUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Solicitacao] ADD CONSTRAINT [FK_Solicitacao_TipoVeiculo] FOREIGN KEY ([nCdTpVeiculo]) REFERENCES [dbo].[TipoVeiculo]([nCdTpVeiculo]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SolicitacaoCentroCusto] ADD CONSTRAINT [FK_SolicitacaoCentroCusto_CentroCusto] FOREIGN KEY ([nCdFilial], [nCdCentroCusto]) REFERENCES [dbo].[CentroCusto]([nCdFilial],[nCdCentroCusto]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SolicitacaoCentroCusto] ADD CONSTRAINT [FK_SolicitacaoCentroCusto_MotivoRecusa] FOREIGN KEY ([nCdMotivoRecusa]) REFERENCES [dbo].[Motivo]([nCdMotivo]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SolicitacaoCentroCusto] ADD CONSTRAINT [FK_SolicitacaoCentroCusto_Solicitacao] FOREIGN KEY ([nCdSolicitacao]) REFERENCES [dbo].[Solicitacao]([nCdSolicitacao]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SolicitacaoCentroCusto] ADD CONSTRAINT [FK_SolicitacaoCentroCusto_Usuario] FOREIGN KEY ([nCdAprovador]) REFERENCES [dbo].[Usuario]([nCdUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SolicitacaoPassageiro] ADD CONSTRAINT [FK_SolicitacaoPassageiro_Solicitacao] FOREIGN KEY ([nCdSolicitacao]) REFERENCES [dbo].[Solicitacao]([nCdSolicitacao]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Usuario] ADD CONSTRAINT [FK_Usuario_CentroCusto] FOREIGN KEY ([nCdFilial], [nCdCentroCusto]) REFERENCES [dbo].[CentroCusto]([nCdFilial],[nCdCentroCusto]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Usuario] ADD CONSTRAINT [FK_Usuario_Filial] FOREIGN KEY ([nCdFilial]) REFERENCES [dbo].[Filial]([nCdFilial]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Usuario] ADD CONSTRAINT [FK_Usuario_Fornecedor] FOREIGN KEY ([nCdFornecedor]) REFERENCES [dbo].[Fornecedor]([nCdFornecedor]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UsuarioPerfil] ADD CONSTRAINT [FK_UsuarioPerfil_Usuario] FOREIGN KEY ([nCdUsuario]) REFERENCES [dbo].[Usuario]([nCdUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Veiculo] ADD CONSTRAINT [FK_Veiculo_Fornecedor] FOREIGN KEY ([nCdFornecedor]) REFERENCES [dbo].[Fornecedor]([nCdFornecedor]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Veiculo] ADD CONSTRAINT [FK_Veiculo_TipoVeiculo] FOREIGN KEY ([nCdTpVeiculo]) REFERENCES [dbo].[TipoVeiculo]([nCdTpVeiculo]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RotaFixa] ADD CONSTRAINT [FK_RotaFixa_Contrato] FOREIGN KEY ([nCdContrato]) REFERENCES [dbo].[Contrato]([nCdContrato]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RotaFixa] ADD CONSTRAINT [FK_RotaFixa_Destino] FOREIGN KEY ([nCdEnderecoDestino]) REFERENCES [dbo].[Endereco]([nCdEndereco]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RotaFixa] ADD CONSTRAINT [FK_RotaFixa_Origem] FOREIGN KEY ([nCdEnderecoOrigem]) REFERENCES [dbo].[Endereco]([nCdEndereco]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PerguntaContrato] ADD CONSTRAINT [FK_PerguntaContrato_Contrato] FOREIGN KEY ([nCdContrato]) REFERENCES [dbo].[Contrato]([nCdContrato]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SolicitacaoResposta] ADD CONSTRAINT [FK_SolicitacaoResposta_PerguntaContrato] FOREIGN KEY ([nCdContrato], [nCdPergunta]) REFERENCES [dbo].[PerguntaContrato]([nCdContrato],[nCdPergunta]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SolicitacaoResposta] ADD CONSTRAINT [FK_SolicitacaoResposta_Solicitacao] FOREIGN KEY ([nCdSolicitacao]) REFERENCES [dbo].[Solicitacao]([nCdSolicitacao]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
