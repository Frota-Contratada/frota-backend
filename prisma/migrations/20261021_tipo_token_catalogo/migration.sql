-- Add the PIN token types required by first access and password reset.
-- Existing rows are kept; only missing types are inserted.
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoToken] WHERE [nCdTpToken] = 1)
        INSERT INTO [dbo].[TipoToken] ([nCdTpToken], [cNmTpToken], [nQtdSegValidade])
        VALUES (1, N'Cadastro de senha', 300);

    IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoToken] WHERE [nCdTpToken] = 2)
        INSERT INTO [dbo].[TipoToken] ([nCdTpToken], [cNmTpToken], [nQtdSegValidade])
        VALUES (2, N'Redefinição de senha', 300);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
