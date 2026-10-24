-- Add the cancellation reason used when an approved request is not realized.
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF EXISTS (
        SELECT 1
        FROM [dbo].[Motivo]
        WHERE [nCdMotivo] = 24
          AND ([cNmMotivo] <> N'Solicitação aprovada, mas não realizada até o final do dia da corrida'
            OR [cTipoMotivo] <> '2')
    )
        THROW 51000, 'Motivo 24 already exists with another meaning; migration stopped.', 1;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[Motivo] WHERE [nCdMotivo] = 24)
        INSERT INTO [dbo].[Motivo] ([nCdMotivo], [cNmMotivo], [cTipoMotivo])
        VALUES (24, N'Solicitação aprovada, mas não realizada até o final do dia da corrida', '2');

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
