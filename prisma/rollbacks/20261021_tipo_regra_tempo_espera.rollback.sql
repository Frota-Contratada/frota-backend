-- Operational rollback for 20261021_tipo_regra_tempo_espera only.
-- Run only after verifying this migration is the latest applied migration
-- and no contract rule uses the waiting-time type.
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;

BEGIN TRY
    BEGIN TRAN;

    IF NOT EXISTS (
           SELECT 1 FROM dbo._prisma_migrations
           WHERE migration_name = N'20261021_tipo_regra_tempo_espera'
             AND finished_at IS NOT NULL AND rolled_back_at IS NULL
       )
       OR EXISTS (
           SELECT 1 FROM dbo._prisma_migrations
           WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
             AND migration_name > N'20261021_tipo_regra_tempo_espera'
       )
    BEGIN
        THROW 51001, 'The expected migration state is not present.', 1;
    END;

    IF EXISTS (SELECT 1 FROM dbo.Regra WHERE nCdTipoRegra = 4)
    BEGIN
        THROW 51002, 'Contract rules using the waiting-time type block this rollback.', 1;
    END;

    DELETE FROM dbo.TipoRegra WHERE nCdTipoRegra = 4;

    DELETE FROM dbo._prisma_migrations
    WHERE migration_name = N'20261021_tipo_regra_tempo_espera';

    COMMIT TRAN;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRAN;
    THROW;
END CATCH;
