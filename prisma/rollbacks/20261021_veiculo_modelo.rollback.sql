-- Operational rollback for 20261021_veiculo_modelo only.
-- Run only after verifying this migration is the latest applied migration.
-- Vehicle models stored in the column are discarded.
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;

BEGIN TRY
    BEGIN TRAN;

    IF NOT EXISTS (
           SELECT 1 FROM dbo._prisma_migrations
           WHERE migration_name = N'20261021_veiculo_modelo'
             AND finished_at IS NOT NULL AND rolled_back_at IS NULL
       )
       OR EXISTS (
           SELECT 1 FROM dbo._prisma_migrations
           WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
             AND migration_name > N'20261021_veiculo_modelo'
       )
    BEGIN
        THROW 51001, 'The expected migration state is not present.', 1;
    END;

    IF COL_LENGTH(N'dbo.Veiculo', N'cModelo') IS NOT NULL
        ALTER TABLE dbo.Veiculo DROP COLUMN cModelo;

    DELETE FROM dbo._prisma_migrations
    WHERE migration_name = N'20261021_veiculo_modelo';

    COMMIT TRAN;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRAN;
    THROW;
END CATCH;
