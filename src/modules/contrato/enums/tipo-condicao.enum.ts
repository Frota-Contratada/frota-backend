/**
 * Tipo persistido em CondicaoRegra.cTipoCondicao. A condição agora é um
 * agregado único por regra; os critérios escalares ficam em cValor e as
 * rotas/pergunta são persistidas nas respectivas tabelas de vínculo.
 */
export enum TipoCondicao {
  COMPLETA = 'CONDICAO_COMPLETA',
}
