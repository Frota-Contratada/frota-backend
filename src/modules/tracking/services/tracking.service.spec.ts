import { Prisma } from '@prisma/client';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TrackingAcessoNegadoException } from '../exceptions/tracking.exceptions';
import { TrackingService } from './tracking.service';

const decimal = (value: number) => new Prisma.Decimal(value);

const trip = {
  nCdCorrida: decimal(1),
  nCdMotorista: decimal(10),
  nCdVeiculo: decimal(20),
  cStatus: 'I',
  dInicioCorrida: new Date('2026-08-24T12:00:00.000Z'),
  dFimCorrida: null,
  Usuario: { cNmUsuario: 'Motorista' },
  Veiculo: { cPlaca: 'ABC1D23', TipoVeiculo: null },
  Solicitacao: {
    nCdSolicitante: decimal(30),
    SolicitacaoPassageiro: [],
    Endereco_Solicitacao_nCdEnderecoOrigemToEndereco: {
      nCdEndereco: decimal(100),
      cEndereco: 'Rua A',
      cNumero: '1',
      cBairro: 'Centro',
      cCidade: 'São Paulo',
      cUf: 'SP',
      nLatitude: decimal(-23.55),
      nLongitude: decimal(-46.63),
    },
    Endereco_Solicitacao_nCdEnderecoDestinoToEndereco: {
      nCdEndereco: decimal(101),
      cEndereco: 'Rua B',
      cNumero: '2',
      cBairro: 'Centro',
      cCidade: 'São Paulo',
      cUf: 'SP',
      nLatitude: decimal(-23.56),
      nLongitude: decimal(-46.64),
    },
    Parada: [],
  },
};

describe('TrackingService', () => {
  const driver = { id: 10, perfis: [TipoPerfil.MOTORISTA] };
  const passenger = { id: 30, perfis: [TipoPerfil.SOLICITANTE] };

  it('permite ao solicitante acessar o tracking pelo ID da corrida iniciada', async () => {
    const route = {
      routeId: '971d6d62-69c8-4cc3-b8fb-37f12192c3b6',
      version: 1,
      calculatedAt: '2026-08-24T12:00:00.000Z',
      origin: {
        id: '100',
        sequence: 0,
        kind: 'origin',
        label: 'Rua A',
        lat: -23.55,
        lng: -46.63,
      },
      stops: [],
      destination: {
        id: '101',
        sequence: 1,
        kind: 'destination',
        label: 'Rua B',
        lat: -23.56,
        lng: -46.64,
      },
      coordinates: [
        { lat: -23.55, lng: -46.63 },
        { lat: -23.56, lng: -46.64 },
      ],
      distanceMeters: 1000,
      durationSeconds: 100,
      trafficDelaySeconds: 0,
      trafficSections: [],
      instructions: [],
    };
    const findTrip = jest.fn().mockResolvedValue(trip);
    const prisma = {
      corrida: { findUnique: findTrip },
      corridaRota: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ cPayload: JSON.stringify(route) }),
      },
      corridaPosicao: { findFirst: jest.fn().mockResolvedValue(null) },
      corridaEspera: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const service = new TrackingService(
      prisma as never,
      {} as never,
      {} as never,
    );

    await expect(service.snapshot(1, passenger)).resolves.toMatchObject({
      tripStatus: 'in_progress',
      route: { routeId: route.routeId },
    });
    expect(findTrip).toHaveBeenCalledWith(
      expect.objectContaining({ where: { nCdCorrida: 1 } }),
    );
  });

  it('impede passageiro de recalcular e não chama o TomTom', async () => {
    const prisma = {
      corrida: { findUnique: jest.fn().mockResolvedValue(trip) },
      comandoIdempotente: {
        create: jest.fn().mockResolvedValue({}),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const tomTom = { calculate: jest.fn() };
    const service = new TrackingService(
      prisma as never,
      tomTom as never,
      { publish: jest.fn() } as never,
    );

    await expect(
      service.reroute(1, passenger, '1f528e04-d384-4fa5-bdd7-42a3bc0bb4cf', {
        lat: -23.55,
        lng: -46.63,
        accuracy: 5,
        speed: 0,
        heading: 0,
        timestamp: '2026-08-24T12:01:00.000Z',
      }),
    ).rejects.toBeInstanceOf(TrackingAcessoNegadoException);
    expect(tomTom.calculate).not.toHaveBeenCalled();
  });

  it('ordena lote, ignora atrasadas e publica somente a posição mais recente', async () => {
    const create = jest.fn((input: { data: { nLatitude: number } }) =>
      Promise.resolve(input),
    );
    const tx = {
      corridaPosicao: {
        findFirst: jest.fn().mockResolvedValue({
          dPosicao: new Date('2026-08-24T12:00:00.000Z'),
        }),
        create,
      },
    };
    const prisma = {
      corrida: { findUnique: jest.fn().mockResolvedValue(trip) },
      $transaction: jest.fn((operation: (client: typeof tx) => unknown) =>
        operation(tx),
      ),
    };
    const events = { publish: jest.fn() };
    const service = new TrackingService(
      prisma as never,
      {} as never,
      events as never,
    );
    const position = (timestamp: string, lat: number) => ({
      lat,
      lng: -46.63,
      accuracy: 5,
      speed: 10,
      heading: 90,
      timestamp,
    });

    const accepted = await service.saveVehiclePositions(1, driver, [
      position('2026-08-24T12:03:00.000Z', 3),
      position('2026-08-24T11:59:00.000Z', 1),
      position('2026-08-24T12:02:00.000Z', 2),
    ]);

    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[0][0].data.nLatitude).toBe(2);
    expect(create.mock.calls[1][0].data.nLatitude).toBe(3);
    expect(accepted?.lat).toBe(3);
    expect(events.publish).toHaveBeenCalledTimes(1);
    expect(events.publish).toHaveBeenCalledWith(
      1,
      'vehicle.location',
      accepted,
    );
    expect(tx.corridaPosicao.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          nCdUsuario: null,
          dPosicao: { lte: expect.any(Date) as Date },
        }) as object,
      }),
    );
  });

  it('isola a posição auxiliar pelo usuário e não a publica na sala', async () => {
    const create = jest.fn().mockResolvedValue({});
    const tx = {
      corridaPosicao: {
        findFirst: jest.fn().mockResolvedValue(null),
        create,
      },
    };
    const prisma = {
      corrida: { findUnique: jest.fn().mockResolvedValue(trip) },
      $transaction: jest.fn((operation: (client: typeof tx) => unknown) =>
        operation(tx),
      ),
    };
    const events = { publish: jest.fn() };
    const service = new TrackingService(
      prisma as never,
      {} as never,
      events as never,
    );

    await service.savePassengerPosition(1, passenger, {
      lat: -23.55,
      lng: -46.63,
      accuracy: 5,
      speed: 0,
      heading: 0,
      timestamp: '2026-08-24T12:01:00.000Z',
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cOrigem: 'P',
          nCdUsuario: passenger.id,
        }) as object,
      }),
    );
    expect(events.publish).not.toHaveBeenCalled();
  });

  it('impede passageiro de finalizar uma corrida', async () => {
    const prisma = {
      corrida: { findUnique: jest.fn().mockResolvedValue(trip) },
      comandoIdempotente: {
        create: jest.fn().mockResolvedValue({}),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new TrackingService(
      prisma as never,
      {} as never,
      {} as never,
    );
    await expect(
      service.finish(1, passenger, 'd508b0f3-aaf0-4bca-887f-f1debd52ed70'),
    ).rejects.toBeInstanceOf(TrackingAcessoNegadoException);
  });

  it('incrementa e persiste a versão antes de publicar route.replaced', async () => {
    const previous = {
      routeId: '971d6d62-69c8-4cc3-b8fb-37f12192c3b6',
      version: 2,
      calculatedAt: '2026-08-24T12:00:00.000Z',
      origin: {
        id: '100',
        sequence: 0,
        kind: 'origin' as const,
        label: 'Rua A',
        lat: -23.55,
        lng: -46.63,
      },
      stops: [],
      destination: {
        id: '101',
        sequence: 1,
        kind: 'destination' as const,
        label: 'Rua B',
        lat: -23.56,
        lng: -46.64,
      },
      coordinates: [
        { lat: -23.55, lng: -46.63 },
        { lat: -23.56, lng: -46.64 },
      ],
      distanceMeters: 1000,
      durationSeconds: 100,
      trafficDelaySeconds: 0,
      trafficSections: [],
      instructions: [],
    };
    const createRoute = jest.fn((input: { data: { cPayload: string } }) =>
      Promise.resolve(input),
    );
    const routeFind = jest
      .fn()
      .mockResolvedValueOnce({ cPayload: JSON.stringify(previous), iVersao: 2 })
      .mockResolvedValueOnce({
        cPayload: JSON.stringify(previous),
        iVersao: 2,
      });
    const commandUpdate = jest.fn().mockResolvedValue({ count: 1 });
    const tx = {
      corridaRota: { findFirst: routeFind, create: createRoute },
      corrida: {
        findUnique: jest.fn().mockResolvedValue({ cStatus: 'I' }),
      },
      comandoIdempotente: { updateMany: commandUpdate },
    };
    const prisma = {
      corrida: { findUnique: jest.fn().mockResolvedValue(trip) },
      corridaRota: { findFirst: routeFind },
      corridaParadaProgresso: { findMany: jest.fn().mockResolvedValue([]) },
      comandoIdempotente: {
        create: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((operation: (client: typeof tx) => unknown) =>
        operation(tx),
      ),
    };
    const calculated = {
      ...previous,
      routeId: '4fbebf2e-030d-401d-a752-51ee6691c9bc',
      version: 3,
      origin: {
        id: 'current',
        sequence: 0,
        kind: 'origin' as const,
        label: 'Atual',
        lat: -23.551,
        lng: -46.631,
      },
    };
    const events = { publish: jest.fn() };
    const service = new TrackingService(
      prisma as never,
      { calculate: jest.fn().mockResolvedValue(calculated) } as never,
      events as never,
    );

    const route = await service.reroute(
      1,
      driver,
      '53dca4de-e2e4-4414-bdb8-9e25ff985990',
      {
        lat: -23.551,
        lng: -46.631,
        accuracy: 5,
        speed: 10,
        heading: 90,
        timestamp: '2026-08-24T12:05:00.000Z',
      },
    );

    expect(route.version).toBe(3);
    expect(createRoute).toHaveBeenCalledTimes(1);
    const persisted = JSON.parse(
      createRoute.mock.calls[0][0].data.cPayload,
    ) as { version: number };
    expect(persisted.version).toBe(3);
    expect(events.publish).toHaveBeenCalledWith(1, 'route.replaced', route);
    expect(createRoute.mock.invocationCallOrder[0]).toBeLessThan(
      events.publish.mock.invocationCallOrder[0],
    );
    expect(commandUpdate.mock.invocationCallOrder[0]).toBeLessThan(
      events.publish.mock.invocationCallOrder[0],
    );
  });

  it('persiste a conclusão da parada de forma idempotente', async () => {
    const stop = {
      iOrdem: 1,
      Endereco:
        trip.Solicitacao.Endereco_Solicitacao_nCdEnderecoOrigemToEndereco,
    };
    const tripWithStop = {
      ...trip,
      Solicitacao: { ...trip.Solicitacao, Parada: [stop] },
    };
    const completedAt = new Date('2026-08-24T12:06:00.000Z');
    const create = jest.fn().mockResolvedValue({ dConcluida: completedAt });
    const tx = {
      corrida: { findUnique: jest.fn().mockResolvedValue({ cStatus: 'I' }) },
      corridaParadaProgresso: {
        findUnique: jest.fn().mockResolvedValue(null),
        create,
      },
      comandoIdempotente: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const prisma = {
      corrida: { findUnique: jest.fn().mockResolvedValue(tripWithStop) },
      comandoIdempotente: {
        create: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((operation: (client: typeof tx) => unknown) =>
        operation(tx),
      ),
    };
    const service = new TrackingService(
      prisma as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.completeStop(
        1,
        1,
        driver,
        '398fba7f-80ea-4c7c-9e3c-a145773c14fa',
      ),
    ).resolves.toEqual({ sequence: 1, completedAt: completedAt.toISOString() });
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nCdCorrida: 1,
        iOrdem: 1,
        nCdUsuario: driver.id,
      }) as object,
    });
  });

  it('remove paradas concluídas do recálculo', async () => {
    const stop = {
      iOrdem: 1,
      Endereco:
        trip.Solicitacao.Endereco_Solicitacao_nCdEnderecoOrigemToEndereco,
    };
    const tripWithStop = {
      ...trip,
      Solicitacao: { ...trip.Solicitacao, Parada: [stop] },
    };
    const route = {
      routeId: '05f46f79-b145-4b6b-8f61-23330698eac8',
      version: 1,
      calculatedAt: '2026-08-24T12:00:00.000Z',
      origin: {
        id: '100',
        sequence: 0,
        kind: 'origin' as const,
        label: 'Rua A',
        lat: -23.55,
        lng: -46.63,
      },
      stops: [],
      destination: {
        id: '101',
        sequence: 1,
        kind: 'destination' as const,
        label: 'Rua B',
        lat: -23.56,
        lng: -46.64,
      },
      coordinates: [
        { lat: -23.55, lng: -46.63 },
        { lat: -23.56, lng: -46.64 },
      ],
      distanceMeters: 1000,
      durationSeconds: 100,
      trafficDelaySeconds: 0,
      trafficSections: [],
      instructions: [],
    };
    const tomTom = { calculate: jest.fn().mockResolvedValue(route) };
    const tx = {
      corrida: { findUnique: jest.fn().mockResolvedValue({ cStatus: 'I' }) },
      corridaRota: {
        findFirst: jest.fn().mockResolvedValue({ iVersao: 1 }),
        create: jest.fn().mockResolvedValue({}),
      },
      comandoIdempotente: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const prisma = {
      corrida: { findUnique: jest.fn().mockResolvedValue(tripWithStop) },
      corridaParadaProgresso: {
        findMany: jest.fn().mockResolvedValue([{ iOrdem: 1 }]),
      },
      corridaRota: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ cPayload: JSON.stringify(route) }),
      },
      comandoIdempotente: {
        create: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((operation: (client: typeof tx) => unknown) =>
        operation(tx),
      ),
    };
    const service = new TrackingService(
      prisma as never,
      tomTom as never,
      { publish: jest.fn() } as never,
    );

    await service.reroute(1, driver, '751a6964-0e68-453c-be0f-d2c14fe66fc0', {
      lat: -23.551,
      lng: -46.631,
      accuracy: 5,
      speed: 10,
      heading: 90,
      timestamp: '2026-08-24T12:07:00.000Z',
    });

    expect(tomTom.calculate).toHaveBeenCalledWith(
      expect.any(Object),
      [],
      expect.any(Object),
      expect.any(Number),
    );
  });

  it('deduplica chamadas concorrentes de espera e devolve o mesmo resultado', async () => {
    let storedCommand:
      | {
          cTipo: string;
          cEstado: string;
          cResultado: string | null;
          dAtualizacao: Date;
        }
      | undefined;
    let releaseWaiting!: () => void;
    const barrier = new Promise<void>((resolve) => {
      releaseWaiting = resolve;
    });
    const uniqueError = new Prisma.PrismaClientKnownRequestError('unique', {
      code: 'P2002',
      clientVersion: '7.8.0',
    });
    const waitCreate = jest.fn(async () => {
      await barrier;
      return { dInicio: new Date('2026-08-24T12:10:00.000Z') };
    });
    const waitingTx = {
      corrida: {
        findUnique: jest.fn().mockResolvedValue({ cStatus: 'I' }),
      },
      corridaEspera: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: waitCreate,
      },
      comandoIdempotente: {
        updateMany: jest.fn(
          (input: { data: { cEstado: string; cResultado: string } }) => {
            storedCommand = {
              cTipo: 'waiting.start',
              ...input.data,
              dAtualizacao: new Date(),
            };
            return Promise.resolve({ count: 1 });
          },
        ),
      },
    };
    const prisma = {
      corrida: { findUnique: jest.fn().mockResolvedValue(trip) },
      comandoIdempotente: {
        create: jest.fn((input: { data: { cTipo: string } }) => {
          if (storedCommand) return Promise.reject(uniqueError);
          storedCommand = {
            cTipo: input.data.cTipo,
            cEstado: 'PROCESSING',
            cResultado: null,
            dAtualizacao: new Date(),
          };
          return Promise.resolve(storedCommand);
        }),
        findUnique: jest.fn(() => Promise.resolve(storedCommand)),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      $transaction: jest.fn(
        (operation: (client: typeof waitingTx) => unknown) =>
          operation(waitingTx),
      ),
    };
    const events = { publish: jest.fn() };
    const service = new TrackingService(
      prisma as never,
      {} as never,
      events as never,
    );
    const key = '3b201609-dd98-4c31-be16-ed306328c11b';

    const first = service.startWaiting(1, driver, key);
    await Promise.resolve();
    const second = service.startWaiting(1, driver, key);
    releaseWaiting();

    const [firstResult, secondResult] = await Promise.all([first, second]);
    expect(secondResult).toEqual(firstResult);
    expect(waitCreate).toHaveBeenCalledTimes(1);
    expect(events.publish).toHaveBeenCalledTimes(1);
  });

  it('recupera uma chave PROCESSING abandonada após o lease', async () => {
    const uniqueError = new Prisma.PrismaClientKnownRequestError('unique', {
      code: 'P2002',
      clientVersion: '7.8.0',
    });
    const staleAt = new Date(Date.now() - 31_000);
    const reclaim = jest.fn().mockResolvedValue({ count: 1 });
    const tx = {
      corrida: { findUnique: jest.fn().mockResolvedValue({ cStatus: 'I' }) },
      corridaEspera: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      comandoIdempotente: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const prisma = {
      corrida: { findUnique: jest.fn().mockResolvedValue(trip) },
      comandoIdempotente: {
        create: jest.fn().mockRejectedValue(uniqueError),
        findUnique: jest.fn().mockResolvedValue({
          cTipo: 'waiting.resume',
          cEstado: 'PROCESSING',
          cResultado: null,
          dAtualizacao: staleAt,
        }),
        updateMany: reclaim,
      },
      $transaction: jest.fn((operation: (client: typeof tx) => unknown) =>
        operation(tx),
      ),
    };
    const service = new TrackingService(
      prisma as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.resume(1, driver, 'ddc89900-f7cf-49d3-af59-c48b93af56b7'),
    ).resolves.toEqual({ active: false, startedAt: null });
    expect(reclaim).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          cEstado: 'PROCESSING',
          dAtualizacao: staleAt,
        }) as object,
      }),
    );
  });

  it('retoma a corrida, encerra a espera e publica o estado persistido', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const commandUpdate = jest.fn().mockResolvedValue({ count: 1 });
    const events = { publish: jest.fn() };
    const tx = {
      corrida: {
        findUnique: jest.fn().mockResolvedValue({ cStatus: 'I' }),
      },
      corridaEspera: { updateMany },
      comandoIdempotente: { updateMany: commandUpdate },
    };
    const prisma = {
      corrida: { findUnique: jest.fn().mockResolvedValue(trip) },
      comandoIdempotente: {
        create: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((operation: (client: typeof tx) => unknown) =>
        operation(tx),
      ),
    };
    const service = new TrackingService(
      prisma as never,
      {} as never,
      events as never,
    );

    await expect(
      service.resume(1, driver, '1c6031b3-276d-43c7-ae4b-121852d4e9a1'),
    ).resolves.toEqual({ active: false, startedAt: null });
    expect(updateMany).toHaveBeenCalledWith({
      where: { nCdCorrida: 1, dFim: null },
      data: { dFim: expect.any(Date) as Date },
    });
    expect(commandUpdate).toHaveBeenCalledTimes(1);
    expect(events.publish).toHaveBeenCalledWith(1, 'waiting.changed', {
      active: false,
      startedAt: null,
    });
  });

  it('finaliza e encerra a espera antes de publicar o novo status', async () => {
    const waitingUpdate = jest.fn().mockResolvedValue({ count: 1 });
    const tripUpdate = jest.fn().mockResolvedValue({});
    const tx = {
      corridaEspera: { updateMany: waitingUpdate },
      corrida: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ cStatus: 'I', dFimCorrida: null }),
        update: tripUpdate,
      },
      comandoIdempotente: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const events = { publish: jest.fn() };
    const prisma = {
      corrida: { findUnique: jest.fn().mockResolvedValue(trip) },
      comandoIdempotente: {
        create: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((operation: (client: typeof tx) => unknown) =>
        operation(tx),
      ),
    };
    const service = new TrackingService(
      prisma as never,
      {} as never,
      events as never,
    );

    const result = await service.finish(
      1,
      driver,
      'be9b2522-289d-487e-ab66-b62b0b31450b',
    );

    expect(result.tripStatus).toBe('finished');
    expect(waitingUpdate).toHaveBeenCalledTimes(1);
    expect(tripUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { nCdCorrida: 1 },
        data: expect.objectContaining({ cStatus: 'F' }) as object,
      }),
    );
    expect(tripUpdate.mock.invocationCallOrder[0]).toBeLessThan(
      events.publish.mock.invocationCallOrder[0],
    );
  });

  it('reconstrói o mesmo snapshot durável após reconexão sem expor role', async () => {
    const route = {
      routeId: 'e0034c27-cacf-4a55-b668-b3a36a0bed3b',
      version: 1,
      calculatedAt: '2026-08-24T12:00:00.000Z',
      origin: {
        id: '100',
        sequence: 0,
        kind: 'origin',
        label: 'Rua A',
        lat: -23.55,
        lng: -46.63,
      },
      stops: [],
      destination: {
        id: '101',
        sequence: 1,
        kind: 'destination',
        label: 'Rua B',
        lat: -23.56,
        lng: -46.64,
      },
      coordinates: [
        { lat: -23.55, lng: -46.63 },
        { lat: -23.56, lng: -46.64 },
      ],
      distanceMeters: 1000,
      durationSeconds: 100,
      trafficDelaySeconds: 0,
      trafficSections: [],
      instructions: [],
    };
    const vehiclePosition = {
      nLatitude: decimal(-23.551),
      nLongitude: decimal(-46.631),
      nAccuracy: decimal(5),
      nSpeed: decimal(10),
      nHeading: decimal(90),
      dPosicao: new Date('2026-08-24T12:05:00.000Z'),
    };
    const prisma = {
      corrida: { findUnique: jest.fn().mockResolvedValue(trip) },
      corridaRota: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ cPayload: JSON.stringify(route) }),
      },
      corridaPosicao: {
        findFirst: jest.fn((input: { where: { cOrigem: string } }) =>
          Promise.resolve(input.where.cOrigem === 'V' ? vehiclePosition : null),
        ),
      },
      corridaEspera: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const service = new TrackingService(
      prisma as never,
      {} as never,
      {} as never,
    );

    const first = await service.snapshot(1, passenger);
    const reconnected = await service.snapshot(1, passenger);
    const driverSnapshot = await service.snapshot(1, driver);

    expect(reconnected).toEqual(first);
    expect(first.vehiclePosition?.timestamp).toBe('2026-08-24T12:05:00.000Z');
    expect(first).not.toHaveProperty('role');
    expect(driverSnapshot.passengerPosition).toBeNull();
    const passengerQueries = prisma.corridaPosicao.findFirst.mock.calls.filter(
      ([input]) => input.where.cOrigem === 'P',
    );
    expect(passengerQueries).toHaveLength(2);
    expect(
      passengerQueries.every(([input]) => input.where.nCdUsuario === 30),
    ).toBe(true);
  });
});
