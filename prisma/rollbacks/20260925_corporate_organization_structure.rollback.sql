-- Operational rollback for 20260925_corporate_organization_structure only.
-- Run only before corporate data is loaded and after verifying this migration
-- is the latest applied migration. Never use this after the data-load phase.
BEGIN TRY
    BEGIN TRAN;

    IF OBJECT_ID(N'dbo.Empresa', N'U') IS NULL
       OR NOT EXISTS (
           SELECT 1 FROM dbo._prisma_migrations
           WHERE migration_name = N'20260925_corporate_organization_structure'
             AND finished_at IS NOT NULL AND rolled_back_at IS NULL
       )
       OR EXISTS (
           SELECT 1 FROM dbo._prisma_migrations
           WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
             AND migration_name NOT IN (
                 N'00000000000000_init',
                 N'20260925_corporate_organization_structure'
             )
       )
    BEGIN
        THROW 51001, 'The expected migration state is not present.', 1;
    END;

    IF EXISTS (SELECT 1 FROM dbo.Empresa)
       OR EXISTS (SELECT 1 FROM dbo.Filial)
       OR EXISTS (SELECT 1 FROM dbo.CentroCusto)
       OR EXISTS (SELECT 1 FROM dbo.FilialFornecedor)
       OR EXISTS (SELECT 1 FROM dbo.SolicitacaoCentroCusto)
       OR EXISTS (SELECT 1 FROM dbo.Motivo WHERE nCdEmpresa IS NOT NULL)
       OR EXISTS (SELECT 1 FROM dbo.Usuario WHERE nCdEmpresa IS NOT NULL)
       OR EXISTS (SELECT 1 FROM dbo.Endereco WHERE cTpLogradouro IS NOT NULL)
       OR EXISTS (
           SELECT 1 FROM dbo.Fornecedor
           WHERE cCNPJCPF IS NULL OR LEN(cNmFornecedor) > 100
              OR nCdBaseFornecedor IS NOT NULL OR nCdEstabFornecedor IS NOT NULL
              OR nDigitoFornecedor IS NOT NULL OR nCdSituacaoCadastro IS NOT NULL
              OR cSituacaoCadastro IS NOT NULL OR dCadastro IS NOT NULL
       )
    BEGIN
        THROW 51002, 'Data added after the structural migration blocks this rollback.', 1;
    END;

    ALTER TABLE dbo.CentroCusto DROP CONSTRAINT FK_CentroCusto_Filial;
    ALTER TABLE dbo.Filial DROP CONSTRAINT FK_Filial_Empresa;
    ALTER TABLE dbo.FilialFornecedor DROP CONSTRAINT FK_FilialFornecedor_Filial;
    ALTER TABLE dbo.Motivo DROP CONSTRAINT FK_Motivo_Filial;
    ALTER TABLE dbo.SolicitacaoCentroCusto DROP CONSTRAINT FK_SolicitacaoCentroCusto_CentroCusto;
    ALTER TABLE dbo.Usuario DROP CONSTRAINT FK_Usuario_CentroCusto;
    ALTER TABLE dbo.Usuario DROP CONSTRAINT FK_Usuario_Filial;

    DROP INDEX IX_Motivo_EscopoTipo ON dbo.Motivo;
    DROP INDEX IX_Usuario_CentroCusto ON dbo.Usuario;
    DROP INDEX UK_Fornecedor_BaseEstab ON dbo.Fornecedor;
    DROP INDEX UK_Fornecedor_cCNPJCPF ON dbo.Fornecedor;

    ALTER TABLE dbo.CentroCusto DROP CONSTRAINT PK_CentroCusto;
    ALTER TABLE dbo.Filial DROP CONSTRAINT PK_Filial;
    ALTER TABLE dbo.FilialFornecedor DROP CONSTRAINT PK_FilialFornecedor;
    ALTER TABLE dbo.SolicitacaoCentroCusto DROP CONSTRAINT PK_SolicitacaoCentroCusto;

    ALTER TABLE dbo.CentroCusto DROP COLUMN nCdEmpresa;
    ALTER TABLE dbo.Filial DROP COLUMN nCdEmpresa, cMnemonico;
    ALTER TABLE dbo.FilialFornecedor DROP COLUMN nCdEmpresa;
    ALTER TABLE dbo.SolicitacaoCentroCusto DROP COLUMN nCdEmpresa;
    ALTER TABLE dbo.Motivo DROP COLUMN nCdEmpresa;
    ALTER TABLE dbo.Usuario DROP COLUMN nCdEmpresa;
    ALTER TABLE dbo.Endereco DROP COLUMN cTpLogradouro;

    ALTER TABLE dbo.Fornecedor DROP COLUMN
        nCdBaseFornecedor, nCdEstabFornecedor, nDigitoFornecedor,
        nCdSituacaoCadastro, cSituacaoCadastro, dCadastro;
    ALTER TABLE dbo.Fornecedor ALTER COLUMN cNmFornecedor VARCHAR(100) NOT NULL;
    ALTER TABLE dbo.Fornecedor ALTER COLUMN cCNPJCPF VARCHAR(14) NOT NULL;
    ALTER TABLE dbo.Fornecedor ADD CONSTRAINT UK_Fornecedor_cCNPJCPF
        UNIQUE NONCLUSTERED (cCNPJCPF);

    ALTER TABLE dbo.CentroCusto ADD CONSTRAINT PK_CentroCusto
        PRIMARY KEY CLUSTERED (nCdFilial, nCdCentroCusto);
    ALTER TABLE dbo.Filial ADD CONSTRAINT PK_Filial
        PRIMARY KEY CLUSTERED (nCdFilial);
    ALTER TABLE dbo.Filial ADD CONSTRAINT UK_Filial_cNmFilial
        UNIQUE NONCLUSTERED (cNmFilial);
    ALTER TABLE dbo.FilialFornecedor ADD CONSTRAINT PK_FilialFornecedor
        PRIMARY KEY CLUSTERED (nCdFilial, nCdFornecedor, nCdContrato);
    ALTER TABLE dbo.SolicitacaoCentroCusto ADD CONSTRAINT PK_SolicitacaoCentroCusto
        PRIMARY KEY CLUSTERED (nCdSolicitacao, nCdFilial, nCdCentroCusto);

    CREATE NONCLUSTERED INDEX IX_Motivo_EscopoTipo
        ON dbo.Motivo (nCdFilial, cTipoMotivo, dDesativacao);
    CREATE NONCLUSTERED INDEX IX_Usuario_CentroCusto
        ON dbo.Usuario (nCdFilial, nCdCentroCusto);

    ALTER TABLE dbo.CentroCusto ADD CONSTRAINT FK_CentroCusto_Filial
        FOREIGN KEY (nCdFilial) REFERENCES dbo.Filial(nCdFilial)
        ON DELETE NO ACTION ON UPDATE NO ACTION;
    ALTER TABLE dbo.FilialFornecedor ADD CONSTRAINT FK_FilialFornecedor_Filial
        FOREIGN KEY (nCdFilial) REFERENCES dbo.Filial(nCdFilial)
        ON DELETE NO ACTION ON UPDATE NO ACTION;
    ALTER TABLE dbo.Motivo ADD CONSTRAINT FK_Motivo_Filial
        FOREIGN KEY (nCdFilial) REFERENCES dbo.Filial(nCdFilial)
        ON DELETE NO ACTION ON UPDATE NO ACTION;
    ALTER TABLE dbo.SolicitacaoCentroCusto ADD CONSTRAINT FK_SolicitacaoCentroCusto_CentroCusto
        FOREIGN KEY (nCdFilial, nCdCentroCusto)
        REFERENCES dbo.CentroCusto(nCdFilial, nCdCentroCusto)
        ON DELETE NO ACTION ON UPDATE NO ACTION;
    ALTER TABLE dbo.Usuario ADD CONSTRAINT FK_Usuario_CentroCusto
        FOREIGN KEY (nCdFilial, nCdCentroCusto)
        REFERENCES dbo.CentroCusto(nCdFilial, nCdCentroCusto)
        ON DELETE NO ACTION ON UPDATE NO ACTION;
    ALTER TABLE dbo.Usuario ADD CONSTRAINT FK_Usuario_Filial
        FOREIGN KEY (nCdFilial) REFERENCES dbo.Filial(nCdFilial)
        ON DELETE NO ACTION ON UPDATE NO ACTION;

    DROP TABLE dbo.Empresa;
    DELETE FROM dbo._prisma_migrations
    WHERE migration_name = N'20260925_corporate_organization_structure';

    COMMIT TRAN;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH;
