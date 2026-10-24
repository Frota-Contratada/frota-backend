-- Remove the development/provided expiration cancellation reason.
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DELETE FROM [dbo].[Motivo]
    WHERE [nCdMotivo] = 23
      AND [cNmMotivo] = N'Não aprovada até o horário da corrida'
      AND [cTipoMotivo] = '2';

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
