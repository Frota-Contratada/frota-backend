export const HML_WEB_ORIGIN = 'https://frota-contratada-hml.seara.com.br';

export function hmlCorsOrigins(
  configured = process.env.CORS_ORIGINS,
): true | string[] {
  if (!configured?.trim()) return true;
  return [
    ...new Set([
      ...configured
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
      HML_WEB_ORIGIN,
    ]),
  ];
}
