BEGIN TRY

BEGIN TRAN;

-- This structural migration is safe only for empty organizational tables.
-- Populated environments require an approved company-code backfill first.
IF EXISTS (SELECT 1 FROM [dbo].[Filial])
   OR EXISTS (SELECT 1 FROM [dbo].[CentroCusto])
   OR EXISTS (SELECT 1 FROM [dbo].[FilialFornecedor])
   OR EXISTS (SELECT 1 FROM [dbo].[SolicitacaoCentroCusto])
BEGIN
    THROW 51000, 'Company-code backfill is required before this migration.', 1;
END;

-- DropForeignKey
ALTER TABLE [dbo].[CentroCusto] DROP CONSTRAINT [FK_CentroCusto_Filial];

-- DropForeignKey
ALTER TABLE [dbo].[FilialFornecedor] DROP CONSTRAINT [FK_FilialFornecedor_Filial];

-- DropForeignKey
ALTER TABLE [dbo].[Motivo] DROP CONSTRAINT [FK_Motivo_Filial];

-- DropForeignKey
ALTER TABLE [dbo].[SolicitacaoCentroCusto] DROP CONSTRAINT [FK_SolicitacaoCentroCusto_CentroCusto];

-- DropForeignKey
ALTER TABLE [dbo].[Usuario] DROP CONSTRAINT [FK_Usuario_CentroCusto];

-- DropForeignKey
ALTER TABLE [dbo].[Usuario] DROP CONSTRAINT [FK_Usuario_Filial];

-- DropIndex
ALTER TABLE [dbo].[Filial] DROP CONSTRAINT [UK_Filial_cNmFilial];

-- DropIndex
DROP INDEX [IX_Motivo_EscopoTipo] ON [dbo].[Motivo];

-- DropIndex
DROP INDEX [IX_Usuario_CentroCusto] ON [dbo].[Usuario];

-- AlterTable
ALTER TABLE [dbo].[CentroCusto] ADD [nCdEmpresa] DECIMAL(10,0) NOT NULL;
ALTER TABLE [dbo].[CentroCusto] DROP CONSTRAINT [PK_CentroCusto];
ALTER TABLE [dbo].[CentroCusto] ADD CONSTRAINT PK_CentroCusto PRIMARY KEY CLUSTERED ([nCdEmpresa],[nCdFilial],[nCdCentroCusto]);

-- AlterTable
ALTER TABLE [dbo].[Endereco] ADD [cTpLogradouro] VARCHAR(10);

-- AlterTable
ALTER TABLE [dbo].[Filial] ADD [cMnemonico] VARCHAR(50),
[nCdEmpresa] DECIMAL(10,0) NOT NULL;
ALTER TABLE [dbo].[Filial] DROP CONSTRAINT [PK_Filial];
ALTER TABLE [dbo].[Filial] ADD CONSTRAINT PK_Filial PRIMARY KEY CLUSTERED ([nCdEmpresa],[nCdFilial]);

-- AlterTable
ALTER TABLE [dbo].[FilialFornecedor] ADD [nCdEmpresa] DECIMAL(10,0) NOT NULL;
ALTER TABLE [dbo].[FilialFornecedor] DROP CONSTRAINT [PK_FilialFornecedor];
ALTER TABLE [dbo].[FilialFornecedor] ADD CONSTRAINT PK_FilialFornecedor PRIMARY KEY CLUSTERED ([nCdEmpresa],[nCdFilial],[nCdFornecedor],[nCdContrato]);

-- AlterTable
ALTER TABLE [dbo].[Fornecedor] ALTER COLUMN [cNmFornecedor] VARCHAR(150) NOT NULL;
ALTER TABLE [dbo].[Fornecedor] DROP CONSTRAINT [UK_Fornecedor_cCNPJCPF];
ALTER TABLE [dbo].[Fornecedor] ALTER COLUMN [cCNPJCPF] VARCHAR(14) NULL;
ALTER TABLE [dbo].[Fornecedor] ADD CONSTRAINT [UK_Fornecedor_cCNPJCPF] UNIQUE NONCLUSTERED ([cCNPJCPF]);
ALTER TABLE [dbo].[Fornecedor] ADD [cSituacaoCadastro] VARCHAR(50),
[dCadastro] DATETIME,
[nCdBaseFornecedor] DECIMAL(10,0),
[nCdEstabFornecedor] DECIMAL(10,0),
[nCdSituacaoCadastro] DECIMAL(10,0),
[nDigitoFornecedor] DECIMAL(10,0);

-- AlterTable
ALTER TABLE [dbo].[Motivo] ADD [nCdEmpresa] DECIMAL(10,0);

-- AlterTable
ALTER TABLE [dbo].[SolicitacaoCentroCusto] ADD [nCdEmpresa] DECIMAL(10,0) NOT NULL;
ALTER TABLE [dbo].[SolicitacaoCentroCusto] DROP CONSTRAINT [PK_SolicitacaoCentroCusto];
ALTER TABLE [dbo].[SolicitacaoCentroCusto] ADD CONSTRAINT PK_SolicitacaoCentroCusto PRIMARY KEY CLUSTERED ([nCdSolicitacao],[nCdEmpresa],[nCdFilial],[nCdCentroCusto]);

-- AlterTable
ALTER TABLE [dbo].[Usuario] ADD [nCdEmpresa] DECIMAL(10,0);

-- CreateTable
CREATE TABLE [dbo].[Empresa] (
    [nCdEmpresa] DECIMAL(10,0) NOT NULL,
    [cNmEmpresa] VARCHAR(100) NOT NULL,
    [dAtivacao] DATETIME NOT NULL,
    [dDesativacao] DATETIME,
    CONSTRAINT [PK_Empresa] PRIMARY KEY CLUSTERED ([nCdEmpresa])
);

-- CreateIndex
ALTER TABLE [dbo].[Fornecedor] ADD CONSTRAINT [UK_Fornecedor_BaseEstab] UNIQUE NONCLUSTERED ([nCdBaseFornecedor], [nCdEstabFornecedor]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Motivo_EscopoTipo] ON [dbo].[Motivo]([nCdEmpresa], [nCdFilial], [cTipoMotivo], [dDesativacao]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Usuario_CentroCusto] ON [dbo].[Usuario]([nCdEmpresa], [nCdFilial], [nCdCentroCusto]);

-- AddForeignKey
ALTER TABLE [dbo].[CentroCusto] ADD CONSTRAINT [FK_CentroCusto_Filial] FOREIGN KEY ([nCdEmpresa], [nCdFilial]) REFERENCES [dbo].[Filial]([nCdEmpresa],[nCdFilial]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Filial] ADD CONSTRAINT [FK_Filial_Empresa] FOREIGN KEY ([nCdEmpresa]) REFERENCES [dbo].[Empresa]([nCdEmpresa]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FilialFornecedor] ADD CONSTRAINT [FK_FilialFornecedor_Filial] FOREIGN KEY ([nCdEmpresa], [nCdFilial]) REFERENCES [dbo].[Filial]([nCdEmpresa],[nCdFilial]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Motivo] ADD CONSTRAINT [FK_Motivo_Filial] FOREIGN KEY ([nCdEmpresa], [nCdFilial]) REFERENCES [dbo].[Filial]([nCdEmpresa],[nCdFilial]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SolicitacaoCentroCusto] ADD CONSTRAINT [FK_SolicitacaoCentroCusto_CentroCusto] FOREIGN KEY ([nCdEmpresa], [nCdFilial], [nCdCentroCusto]) REFERENCES [dbo].[CentroCusto]([nCdEmpresa],[nCdFilial],[nCdCentroCusto]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Usuario] ADD CONSTRAINT [FK_Usuario_CentroCusto] FOREIGN KEY ([nCdEmpresa], [nCdFilial], [nCdCentroCusto]) REFERENCES [dbo].[CentroCusto]([nCdEmpresa],[nCdFilial],[nCdCentroCusto]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Usuario] ADD CONSTRAINT [FK_Usuario_Filial] FOREIGN KEY ([nCdEmpresa], [nCdFilial]) REFERENCES [dbo].[Filial]([nCdEmpresa],[nCdFilial]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
