IF NOT EXISTS (
  SELECT 1
  FROM sys.columns
  WHERE object_id = OBJECT_ID(N'dbo.Solicitacao')
    AND name = N'nCdTpVeiculo'
)
BEGIN
  ALTER TABLE dbo.Solicitacao
    ADD nCdTpVeiculo DECIMAL(10, 0) NULL;
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.foreign_keys
  WHERE name = N'FK_Solicitacao_TipoVeiculo'
)
BEGIN
  ALTER TABLE dbo.Solicitacao
    ADD CONSTRAINT FK_Solicitacao_TipoVeiculo
      FOREIGN KEY (nCdTpVeiculo)
      REFERENCES dbo.TipoVeiculo (nCdTpVeiculo)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION;
END;
GO
