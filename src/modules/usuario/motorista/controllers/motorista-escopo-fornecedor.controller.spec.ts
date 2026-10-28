import { ForbiddenException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { DirecaoOrdenacao } from '@common/enums/direcao-ordenacao.enum';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { Motorista } from '../domain/motorista';
import { MotoristaNaoEncontradoException } from '../exceptions/motorista-nao-encontrado.exception';
import { BuscarMotoristaService } from '../services/buscar-motorista.service';
import { BuscarMotoristaController } from './buscar-motorista.controller';
import { CriarMotoristaController } from './criar-motorista.controller';

const adminMaster: AuthenticatedUser = {
  id: 1,
  perfis: [TipoPerfil.ADMIN_MASTER],
};
const adminFilial: AuthenticatedUser = {
  id: 2,
  perfis: [TipoPerfil.ADMIN_FILIAL],
  empresaId: 30,
  filialId: 704,
};
const adminFornecedor: AuthenticatedUser = {
  id: 3,
  perfis: [TipoPerfil.ADMIN_FORNECEDOR],
  fornecedorId: 864,
};

const motoristaDo = (fornecedorId: number) =>
  new Motorista(
    'Motorista',
    'motorista@frota.com.br',
    DateTime.fromISO('2026-10-01T12:00:00Z'),
    50,
    fornecedorId,
  );

const query = { direcao: DirecaoOrdenacao.ASC, page: 1, limit: 10 };

describe('Motoristas no escopo do admin de fornecedor', () => {
  describe('CriarMotoristaController', () => {
    const body = {
      nome: 'Novo',
      email: 'novo@frota.com.br',
      cpf: '52998224725',
      fornecedorId: 1,
    };

    const criarCom = async (usuario: AuthenticatedUser) => {
      const service = {
        execute: jest.fn().mockResolvedValue(motoristaDo(864)),
      };
      await new CriarMotoristaController(service as never).handle(
        usuario,
        body,
      );
      const [, , , fornecedorId] = service.execute.mock.calls[0] as unknown[];
      return fornecedorId;
    };

    it('cadastra no fornecedor do admin de fornecedor, ignorando o enviado', async () => {
      expect(await criarCom(adminFornecedor)).toBe(864);
    });

    it('usa o fornecedor enviado pelo admin master e pelo admin de filial', async () => {
      expect(await criarCom(adminMaster)).toBe(1);
      expect(await criarCom(adminFilial)).toBe(1);
    });

    it('recusa admin de fornecedor sem vínculo de fornecedor', async () => {
      await expect(
        criarCom({ ...adminFornecedor, fornecedorId: undefined }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('BuscarMotoristaController', () => {
    const controllerCom = (motorista: Motorista | null) => {
      const repository = { buscar: jest.fn().mockResolvedValue(motorista) };
      const buscarVarios = {
        execute: jest.fn().mockResolvedValue({
          data: [],
          totalCount: 0,
          hasNextPage: false,
        }),
      };
      const controller = new BuscarMotoristaController(
        new BuscarMotoristaService(repository as never),
        buscarVarios as never,
      );
      return { controller, buscarVarios };
    };

    it('lista só os motoristas do próprio fornecedor', async () => {
      const { controller, buscarVarios } = controllerCom(null);

      await controller.buscarVarios(adminFornecedor, {
        ...query,
        fornecedorId: 6796,
      });

      expect(buscarVarios.execute).toHaveBeenCalledWith(
        expect.objectContaining({ fornecedorId: 864 }),
      );
    });

    it('mantém o filtro de fornecedor pedido pelo admin master', async () => {
      const { controller, buscarVarios } = controllerCom(null);

      await controller.buscarVarios(adminMaster, {
        ...query,
        fornecedorId: 6796,
      });
      await controller.buscarVarios(adminMaster, query);

      expect(buscarVarios.execute).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ fornecedorId: 6796 }),
      );
      expect(buscarVarios.execute).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ fornecedorId: undefined }),
      );
    });

    it('responde 404 para motorista de outro fornecedor', async () => {
      const { controller } = controllerCom(motoristaDo(6796));

      await expect(
        controller.buscar(adminFornecedor, 50),
      ).rejects.toBeInstanceOf(MotoristaNaoEncontradoException);
    });

    it('devolve motorista do próprio fornecedor e qualquer um ao admin de filial', async () => {
      await expect(
        controllerCom(motoristaDo(864)).controller.buscar(adminFornecedor, 50),
      ).resolves.toMatchObject({ response: { fornecedorId: 864 } });
      await expect(
        controllerCom(motoristaDo(6796)).controller.buscar(adminFilial, 50),
      ).resolves.toMatchObject({ response: { fornecedorId: 6796 } });
    });
  });
});
