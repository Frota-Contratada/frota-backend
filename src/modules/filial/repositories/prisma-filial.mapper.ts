import {
  Filial as PrismaFilial,
  Endereco as PrismaEndereco,
} from '@prisma/client';
import { Filial } from '../domain/filial';
import { Endereco } from '../domain/endereco';
import { DateTime } from 'luxon';

type PrismaFilialComEndereco = PrismaFilial & { Endereco: PrismaEndereco };

export class PrismaFilialMapper {
  static toDomain(entity: PrismaFilialComEndereco): Filial;
  static toDomain(entity: PrismaFilialComEndereco | null): Filial | null;
  static toDomain(entity: PrismaFilialComEndereco | null): Filial | null {
    if (entity == null) return null;

    const endereco = new Endereco(
      entity.Endereco.cEndereco,
      entity.Endereco.cNumero,
      entity.Endereco.cBairro,
      entity.Endereco.cCidade,
      entity.Endereco.cUf,
      entity.Endereco.cCEP,
      entity.Endereco.nLatitude.toNumber(),
      entity.Endereco.nLongitude.toNumber(),
      entity.Endereco.nCdEndereco.toNumber(),
      entity.Endereco.cComplemento ?? undefined,
    );

    return new Filial(
      entity.cNmFilial,
      entity.cCNPJ,
      endereco,
      entity.nCdFilial.toNumber(),
      DateTime.fromJSDate(entity.dAtivacao),
      entity.dDesativacao == null
        ? undefined
        : DateTime.fromJSDate(entity.dDesativacao),
    );
  }
}
