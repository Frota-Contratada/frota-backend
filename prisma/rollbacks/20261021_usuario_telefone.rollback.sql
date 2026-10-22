-- Operational rollback for 20261021_usuario_telefone only.
-- Run only after verifying this migration is the latest applied migration.
-- Phones stored in the column are discarded.
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;

BEGIN TRY
    BEGIN TRAN;

    IF NOT EXISTS (
           SELECT 1 FROM dbo._prisma_migrations
           WHERE migration_name = N'20261021_usuario_telefone'
             AND finished_at IS NOT NULL AND rolled_back_at IS NULL
       )
       OR EXISTS (
           SELECT 1 FROM dbo._prisma_migrations
           WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
             AND migration_name > N'20261021_usuario_telefone'
       )
    BEGIN
        THROW 51001, 'The expected migration state is not present.', 1;
    END;

    IF COL_LENGTH(N'dbo.Usuario', N'cTelefone') IS NOT NULL
        ALTER TABLE dbo.Usuario DROP COLUMN cTelefone;

    DELETE FROM dbo._prisma_migrations
    WHERE migration_name = N'20261021_usuario_telefone';

    COMMIT TRAN;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRAN;
    THROW;
END CATCH;
