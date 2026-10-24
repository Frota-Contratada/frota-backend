-- Remove the development/provided non-realized cancellation reason.
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DELETE FROM [dbo].[Motivo]
    WHERE [nCdMotivo] = 24
      AND [cNmMotivo] = N'Solicitação aprovada, mas não realizada até o final do dia da corrida'
      AND [cTipoMotivo] = '2';

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
