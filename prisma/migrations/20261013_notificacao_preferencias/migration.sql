BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[UsuarioPreferenciaNotificacao] (
    [nCdUsuario] DECIMAL(10,0) NOT NULL,
    [cPushAtivo] CHAR(1) NOT NULL CONSTRAINT [DF_UsuarioPreferenciaNotificacao_cPushAtivo] DEFAULT 'S',
    [cLembreteViagem] CHAR(1) NOT NULL CONSTRAINT [DF_UsuarioPreferenciaNotificacao_cLembreteViagem] DEFAULT 'S',
    [cCorridaConfirmada] CHAR(1) NOT NULL CONSTRAINT [DF_UsuarioPreferenciaNotificacao_cCorridaConfirmada] DEFAULT 'S',
    [cSolicitacaoEncerrada] CHAR(1) NOT NULL CONSTRAINT [DF_UsuarioPreferenciaNotificacao_cSolicitacaoEncerrada] DEFAULT 'S',
    [cCorridaCancelada] CHAR(1) NOT NULL CONSTRAINT [DF_UsuarioPreferenciaNotificacao_cCorridaCancelada] DEFAULT 'S',
    [cAprovacaoPendente] CHAR(1) NOT NULL CONSTRAINT [DF_UsuarioPreferenciaNotificacao_cAprovacaoPendente] DEFAULT 'S',
    [cDecisaoFornecedor] CHAR(1) NOT NULL CONSTRAINT [DF_UsuarioPreferenciaNotificacao_cDecisaoFornecedor] DEFAULT 'S',
    [dCriacao] DATETIME2 NOT NULL CONSTRAINT [DF_UsuarioPreferenciaNotificacao_dCriacao] DEFAULT CURRENT_TIMESTAMP,
    [dAtualizacao] DATETIME2 NOT NULL,
    CONSTRAINT [PK_UsuarioPreferenciaNotificacao] PRIMARY KEY CLUSTERED ([nCdUsuario])
);

-- AddForeignKey
ALTER TABLE [dbo].[UsuarioPreferenciaNotificacao] ADD CONSTRAINT [FK_UsuarioPreferenciaNotificacao_Usuario] FOREIGN KEY ([nCdUsuario]) REFERENCES [dbo].[Usuario]([nCdUsuario]) ON DELETE CASCADE ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
