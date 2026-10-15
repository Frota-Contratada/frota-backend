import { HML_WEB_ORIGIN, hmlCorsOrigins } from './hml-cors-origins';

describe('hmlCorsOrigins', () => {
  it('preserva origens configuradas e permite a nova origem HML', () => {
    expect(
      hmlCorsOrigins(
        'http://frota.local,https://frota-contratada.hml.seara.com.br',
      ),
    ).toEqual([
      'http://frota.local',
      'https://frota-contratada.hml.seara.com.br',
      HML_WEB_ORIGIN,
    ]);
  });

  it('preserva o comportamento existente sem lista configurada', () => {
    expect(hmlCorsOrigins('')).toBe(true);
  });
});
