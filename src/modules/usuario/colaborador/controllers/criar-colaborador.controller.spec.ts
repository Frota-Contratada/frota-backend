import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DateTime } from 'luxon';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { Colaborador } from '../domain/colaborador';
import { CriarColaboradorController } from './criar-colaborador.controller';
import { CriarColaboradorRequestSchema } from './dtos/request/criar-colaborador-request.dto';

const body = CriarColaboradorRequestSchema.parse({
  nome: 'Visitante',
  email: 'visitante@exemplo.com',
  empresaId: 1,
  filialId: 10,
  centroCustoId: 4704,
  perfis: [TipoPerfil.SOLICITANTE],
});

function criarCom(usuario: AuthenticatedUser, dados = body) {
  const service = {
    execute: jest
      .fn()
      .mockResolvedValue(
        new Colaborador(
          'Visitante',
          'visitante@exemplo.com',
          DateTime.now(),
          9200,
        ),
      ),
  };
  const resultado = new CriarColaboradorController(service as never).handle(
    usuario,
    dados,
  );
  return { service, resultado };
}

describe('CriarColaboradorController', () => {
  it('usa a filial enviada pelo admin master', async () => {
    const { service, resultado } = criarCom({
      id: 1,
      perfis: [TipoPerfil.ADMIN_MASTER],
    });

    await expect(resultado).resolves.toMatchObject({ response: { id: 9200 } });
    expect(service.execute).toHaveBeenCalledWith(
      expect.objectContaining({ empresaId: 1, filialId: 10 }),
    );
  });

  it('cadastra sempre na filial do admin de filial', async () => {
    const { service, resultado } = criarCom({
      id: 2,
      perfis: [TipoPerfil.ADMIN_FILIAL],
      empresaId: 30,
      filialId: 704,
    });

    await resultado;
    expect(service.execute).toHaveBeenCalledWith(
      expect.objectContaining({ empresaId: 30, filialId: 704 }),
    );
  });

  it('exige filial do admin master', async () => {
    const { resultado } = criarCom(
      { id: 1, perfis: [TipoPerfil.ADMIN_MASTER] },
      { ...body, filialId: undefined },
    );

    await expect(resultado).rejects.toBeInstanceOf(BadRequestException);
  });

  it('recusa admin de filial sem vínculo de filial', async () => {
    const { resultado } = criarCom({
      id: 2,
      perfis: [TipoPerfil.ADMIN_FILIAL],
    });

    await expect(resultado).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('CriarColaboradorRequestSchema', () => {
  const valido = {
    nome: '  Visitante  ',
    email: ' Visitante@Exemplo.COM ',
    cpf: '529.982.247-25',
    centroCustoId: 4704,
    perfis: [TipoPerfil.SOLICITANTE],
  };

  it('normaliza nome, e-mail e CPF', () => {
    expect(CriarColaboradorRequestSchema.parse(valido)).toMatchObject({
      nome: 'Visitante',
      email: 'visitante@exemplo.com',
      cpf: '52998224725',
    });
  });

  it('exige solicitante junto com emergência', () => {
    expect(
      CriarColaboradorRequestSchema.safeParse({
        ...valido,
        perfis: [TipoPerfil.APROVADOR, TipoPerfil.SOLICITANTE_EMERGENCIA],
      }).success,
    ).toBe(false);
  });

  it('não aceita perfis administrativos', () => {
    expect(
      CriarColaboradorRequestSchema.safeParse({
        ...valido,
        perfis: [TipoPerfil.ADMIN_MASTER],
      }).success,
    ).toBe(false);
  });
});
