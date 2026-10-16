export const HML_WEB_ORIGIN = 'https://frota-contratada-hml.seara.com.br';

export function hmlCorsOrigins(
  configured = process.env.CORS_ORIGINS,
): true | string[] {
  if (!configured?.trim()) return true;
  const fixedOrigins = process.env.DEMO_MODE === 'true' ? [] : [HML_WEB_ORIGIN];
  return [
    ...new Set([
      ...configured
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
      ...fixedOrigins,
    ]),
  ];
}
