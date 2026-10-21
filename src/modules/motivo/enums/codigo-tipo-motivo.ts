import { TipoMotivo } from './tipo-motivo.enum';

const CODIGO_POR_TIPO: Record<TipoMotivo, string> = {
  [TipoMotivo.SOLICITACAO]: '1',
  [TipoMotivo.CANCELAMENTO]: '2',
  [TipoMotivo.RECUSA]: '3',
  [TipoMotivo.OBJETO]: '4',
};

const TIPOS = Object.values(TipoMotivo) as string[];

export function codigoDoTipoMotivo(tipo: TipoMotivo): string {
  return CODIGO_POR_TIPO[tipo];
}

export function valoresPersistidosDoTipoMotivo(tipo: TipoMotivo): string[] {
  return [CODIGO_POR_TIPO[tipo], tipo];
}

export function tipoMotivoDoValorPersistido(
  valor: string,
): TipoMotivo | undefined {
  const normalizado = valor.trim();

  if (TIPOS.includes(normalizado)) return normalizado as TipoMotivo;

  return (Object.keys(CODIGO_POR_TIPO) as TipoMotivo[]).find(
    (tipo) => CODIGO_POR_TIPO[tipo] === normalizado,
  );
}

export function codigoDoValorPersistido(valor: string): string {
  const tipo = tipoMotivoDoValorPersistido(valor);

  return tipo ? CODIGO_POR_TIPO[tipo] : valor.trim();
}
