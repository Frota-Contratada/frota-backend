-- Permit users without CPF while retaining uniqueness for populated values.
-- The previous object is the unique constraint created by the initial migration.
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.key_constraints AS kc
        WHERE kc.parent_object_id = OBJECT_ID(N'[dbo].[Usuario]')
          AND kc.name = N'UK_Usuario_cCPF'
          AND kc.type = 'UQ'
    )
        THROW 51000, 'Expected Usuario CPF unique constraint is absent; migration stopped.', 1;

    ALTER TABLE [dbo].[Usuario] DROP CONSTRAINT [UK_Usuario_cCPF];

    CREATE UNIQUE NONCLUSTERED INDEX [UK_Usuario_cCPF]
        ON [dbo].[Usuario]([cCPF])
        WHERE [cCPF] IS NOT NULL;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
