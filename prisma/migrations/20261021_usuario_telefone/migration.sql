-- Add the optional contact phone collected in the driver registration.
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF COL_LENGTH(N'dbo.Usuario', N'cTelefone') IS NULL
        ALTER TABLE [dbo].[Usuario] ADD [cTelefone] VARCHAR(20) NULL;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
