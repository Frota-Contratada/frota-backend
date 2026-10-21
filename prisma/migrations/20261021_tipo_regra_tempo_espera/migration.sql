-- Add the waiting-time rule type used by the final ride value.
-- The catalog row is reference data required by TIPO_REGRA_ID.TEMPO_ESPERA.
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF EXISTS (
        SELECT 1
        FROM [dbo].[TipoRegra]
        WHERE [nCdTipoRegra] = 4
          AND [cNmRegra] <> N'Tempo de espera'
    )
        THROW 51000, 'TipoRegra 4 already exists with another meaning; migration stopped.', 1;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoRegra] WHERE [nCdTipoRegra] = 4)
        INSERT INTO [dbo].[TipoRegra] ([nCdTipoRegra], [cNmRegra])
        VALUES (4, N'Tempo de espera');

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
