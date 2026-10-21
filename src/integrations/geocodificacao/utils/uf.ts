const UF_POR_ESTADO: Record<string, string> = {
  acre: 'AC',
  alagoas: 'AL',
  amapa: 'AP',
  amazonas: 'AM',
  bahia: 'BA',
  ceara: 'CE',
  'distrito federal': 'DF',
  'espirito santo': 'ES',
  goias: 'GO',
  maranhao: 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  para: 'PA',
  paraiba: 'PB',
  parana: 'PR',
  pernambuco: 'PE',
  piaui: 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  rondonia: 'RO',
  roraima: 'RR',
  'santa catarina': 'SC',
  'sao paulo': 'SP',
  sergipe: 'SE',
  tocantins: 'TO',
};

export function paraUf(estado?: string | null): string | undefined {
  const valor = estado?.trim();
  if (!valor) return undefined;
  if (valor.length === 2) return valor.toUpperCase();

  const normalizado = valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return UF_POR_ESTADO[normalizado];
}

export function somenteDigitos(valor?: string | null): string | undefined {
  const digitos = valor?.replace(/\D/g, '');
  return digitos ? digitos : undefined;
}

export function textoOuIndefinido(valor?: string | null): string | undefined {
  const texto = valor?.trim();
  return texto ? texto : undefined;
}
