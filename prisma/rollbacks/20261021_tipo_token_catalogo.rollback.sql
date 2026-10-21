-- Operational rollback for 20261021_tipo_token_catalogo only.
-- Run only after verifying this migration is the latest applied migration
-- and no PIN was issued with these token types.
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;

BEGIN TRY
    BEGIN TRAN;

    IF NOT EXISTS (
           SELECT 1 FROM dbo._prisma_migrations
           WHERE migration_name = N'20261021_tipo_token_catalogo'
             AND finished_at IS NOT NULL AND rolled_back_at IS NULL
       )
       OR EXISTS (
           SELECT 1 FROM dbo._prisma_migrations
           WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
             AND migration_name > N'20261021_tipo_token_catalogo'
       )
    BEGIN
        THROW 51001, 'The expected migration state is not present.', 1;
    END;

    IF EXISTS (SELECT 1 FROM dbo.PinUsuario WHERE nCdTpToken IN (1, 2))
    BEGIN
        THROW 51002, 'Issued PINs using these token types block this rollback.', 1;
    END;

    DELETE FROM dbo.TipoToken WHERE nCdTpToken IN (1, 2);

    DELETE FROM dbo._prisma_migrations
    WHERE migration_name = N'20261021_tipo_token_catalogo';

    COMMIT TRAN;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRAN;
    THROW;
END CATCH;
