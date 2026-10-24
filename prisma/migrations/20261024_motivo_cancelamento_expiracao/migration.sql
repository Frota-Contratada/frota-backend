-- Add the cancellation reason used when a pending request expires.
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF EXISTS (
        SELECT 1
        FROM [dbo].[Motivo]
        WHERE [nCdMotivo] = 23
          AND ([cNmMotivo] <> N'Não aprovada até o horário da corrida'
            OR [cTipoMotivo] <> '2')
    )
        THROW 51000, 'Motivo 23 already exists with another meaning; migration stopped.', 1;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[Motivo] WHERE [nCdMotivo] = 23)
        INSERT INTO [dbo].[Motivo] ([nCdMotivo], [cNmMotivo], [cTipoMotivo])
        VALUES (23, N'Não aprovada até o horário da corrida', '2');

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
