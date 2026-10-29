import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { CorridaNaoPodeSerIniciadaException } from '../exceptions';
import { PrismaMotoristaCorridaRepository } from './prisma-motorista-corrida.repository';

const endereco = {
  cEndereco: 'Rua Irineu José Bordon',
  cNumero: '335',
  cBairro: 'Parque Anhanguera',
  cCidade: 'São Paulo',
  cUf: 'SP',
};

const corridaAgendadaEm = (minutos: number, id = 5101) => ({
  nCdCorrida: new Prisma.Decimal(id),
  nCdSolicitacao: new Prisma.Decimal(id - 4000),
  cStatus: 'A',
  dInicioCorrida: new Date(Date.now() + minutos * 60_000),
  dFimCorrida: null,
  Solicitacao: {
    dCorrida: new Date(Date.now() + minutos * 60_000),
    nCdTipoCorrida: new Prisma.Decimal(1),
    nValorEstimado: new Prisma.Decimal(77.17),
    Endereco_Solicitacao_nCdEnderecoOrigemToEndereco: endereco,
    Endereco_Solicitacao_nCdEnderecoDestinoToEndereco: endereco,
    Parada: [],
    Usuario: { cNmUsuario: 'Juliana Carvalho' },
  },
  Veiculo: { cPlaca: 'RNT1A23' },
  RecusaCorrida: [],
});

const montar = (corridas: ReturnType<typeof corridaAgendadaEm>[]) => {
  const tipoCorrida = {
    findMany: jest.fn().mockResolvedValue([
      {
        nCdTipoCorrida: new Prisma.Decimal(1),
        cNmTipoCorrida: 'Transporte de passageiro',
      },
    ]),
  };
  const corrida = {
    findMany: jest.fn().mockResolvedValue(corridas),
    findFirst: jest.fn().mockResolvedValue(corridas[0]),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
  };
  const prisma = {
    corrida,
    tipoCorrida,
    $transaction: (fn: (tx: unknown) => unknown) =>
      fn({ corrida, tipoCorrida }),
  };
  return {
    repository: new PrismaMotoristaCorridaRepository(prisma as never),
    corrida,
  };
};

describe('PrismaMotoristaCorridaRepository: janela de início', () => {
  it('libera "Iniciar" só para a agendada a até 30 min do horário', async () => {
    const { repository } = montar([
      corridaAgendadaEm(10, 5101),
      corridaAgendadaEm(45, 5104),
      corridaAgendadaEm(24 * 60, 5105),
    ]);

    const viagens = await repository.buscarViagens(
      8,
      DateTime.now(),
      DateTime.now().plus({ days: 2 }),
    );

    expect(viagens.map((v) => [v.id, v.ehProxima])).toEqual([
      [5101, true],
      [5104, false],
      [5105, false],
    ]);
    expect(viagens[0].minutosRestantes).toBeLessThanOrEqual(10);
    expect(viagens[1].minutosRestantes).toBeUndefined();
  });

  it('continua liberando a corrida atrasada', async () => {
    const { repository } = montar([corridaAgendadaEm(-20)]);

    const [viagem] = await repository.buscarViagens(
      8,
      DateTime.now().minus({ days: 1 }),
      DateTime.now(),
    );

    expect(viagem.ehProxima).toBe(true);
  });

  it('recusa iniciar antes da janela e inicia dentro dela', async () => {
    const cedo = montar([corridaAgendadaEm(45)]);
    await expect(cedo.repository.iniciar(5101, 8)).rejects.toBeInstanceOf(
      CorridaNaoPodeSerIniciadaException,
    );
    expect(cedo.corrida.updateMany).not.toHaveBeenCalled();

    const naHora = montar([corridaAgendadaEm(10)]);
    await naHora.repository.iniciar(5101, 8);
    expect(naHora.corrida.updateMany).toHaveBeenCalled();
  });
});
