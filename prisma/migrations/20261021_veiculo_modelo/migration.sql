-- Add the optional vehicle model collected in the fleet registration.
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF COL_LENGTH(N'dbo.Veiculo', N'cModelo') IS NULL
        ALTER TABLE [dbo].[Veiculo] ADD [cModelo] VARCHAR(60) NULL;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
