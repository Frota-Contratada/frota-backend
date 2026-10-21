import { DirecaoOrdenacao } from '@common/enums/direcao-ordenacao.enum';
import { CampoOrdenacaoColaborador } from '../../../enums/ordenacao-colaborador.enum';
import { BuscarColaboradoresQuerySchema } from './buscar-colaboradores-query.dto';

describe('BuscarColaboradoresQuerySchema', () => {
  it('aceita o campo de ordenação e usa direção crescente por padrão', () => {
    expect(
      BuscarColaboradoresQuerySchema.parse({ ordenarPor: 'cargo' }),
    ).toMatchObject({
      ordenarPor: CampoOrdenacaoColaborador.CARGO,
      direcao: DirecaoOrdenacao.ASC,
    });
  });

  it('recusa campo de ordenação desconhecido', () => {
    expect(
      BuscarColaboradoresQuerySchema.safeParse({ ordenarPor: 'cpf' }).success,
    ).toBe(false);
  });
});
