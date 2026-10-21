import { ProvedorGeograficoIndisponivelException } from '../exceptions/provedor-geografico-indisponivel.exception';

export async function buscarJson(
  provedor: string,
  url: URL,
  timeoutMs: number,
): Promise<unknown> {
  let resposta: Response;

  try {
    resposta = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        Accept: 'application/json',
        'User-Agent': 'frota-backend/1.0',
      },
    });
  } catch {
    throw new ProvedorGeograficoIndisponivelException(provedor);
  }

  if (!resposta.ok) {
    throw new ProvedorGeograficoIndisponivelException(provedor);
  }

  try {
    return await resposta.json();
  } catch {
    throw new ProvedorGeograficoIndisponivelException(provedor);
  }
}
