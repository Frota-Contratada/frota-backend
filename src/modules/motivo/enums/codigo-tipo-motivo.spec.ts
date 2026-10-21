import {
  codigoDoTipoMotivo,
  codigoDoValorPersistido,
  tipoMotivoDoValorPersistido,
  valoresPersistidosDoTipoMotivo,
} from './codigo-tipo-motivo';
import { TipoMotivo } from './tipo-motivo.enum';

describe('codigo-tipo-motivo', () => {
  it('grava o tipo usando o código numérico do seed', () => {
    expect(codigoDoTipoMotivo(TipoMotivo.SOLICITACAO)).toBe('1');
    expect(codigoDoTipoMotivo(TipoMotivo.CANCELAMENTO)).toBe('2');
    expect(codigoDoTipoMotivo(TipoMotivo.RECUSA)).toBe('3');
    expect(codigoDoTipoMotivo(TipoMotivo.OBJETO)).toBe('4');
  });

  it('filtra pelo código e pelo nome do tipo', () => {
    expect(valoresPersistidosDoTipoMotivo(TipoMotivo.OBJETO)).toEqual([
      '4',
      'objeto',
    ]);
  });

  it('reconhece o tipo gravado como código ou como nome', () => {
    expect(tipoMotivoDoValorPersistido('2')).toBe(TipoMotivo.CANCELAMENTO);
    expect(tipoMotivoDoValorPersistido(' recusa ')).toBe(TipoMotivo.RECUSA);
    expect(tipoMotivoDoValorPersistido('desconhecido')).toBeUndefined();
  });

  it('converte o valor gravado para o código', () => {
    expect(codigoDoValorPersistido('objeto')).toBe('4');
    expect(codigoDoValorPersistido('4')).toBe('4');
    expect(codigoDoValorPersistido('x')).toBe('x');
  });
});
