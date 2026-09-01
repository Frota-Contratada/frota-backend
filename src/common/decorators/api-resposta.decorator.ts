import { HttpStatus, Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

interface OpcoesResposta {
  status?: HttpStatus;
  description?: string;
}

type EsquemaOpenApi = Record<string, unknown>;

const envelope = (conteudo: EsquemaOpenApi): EsquemaOpenApi => ({
  type: 'object',
  required: ['response'],
  properties: {
    response: conteudo,
    success: { type: 'boolean' },
  },
});

export const ApiRespostaDe = <TModel extends Type<unknown>>(
  model: TModel,
  opcoes: OpcoesResposta = {},
) =>
  applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: opcoes.status ?? HttpStatus.OK,
      description: opcoes.description,
      schema: envelope({ $ref: getSchemaPath(model) }),
    }),
  );

export const ApiRespostaListaDe = <TModel extends Type<unknown>>(
  model: TModel,
  opcoes: OpcoesResposta = {},
) =>
  applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: opcoes.status ?? HttpStatus.OK,
      description: opcoes.description,
      schema: envelope({
        type: 'array',
        items: { $ref: getSchemaPath(model) },
      }),
    }),
  );

export const ApiRespostaPaginadaDe = <TModel extends Type<unknown>>(
  model: TModel,
  opcoes: OpcoesResposta = {},
) =>
  applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: opcoes.status ?? HttpStatus.OK,
      description: opcoes.description,
      schema: envelope({
        type: 'object',
        required: ['totalCount', 'hasNextPage', 'data'],
        properties: {
          totalCount: { type: 'integer', example: 42 },
          hasNextPage: { type: 'boolean', example: true },
          data: { type: 'array', items: { $ref: getSchemaPath(model) } },
        },
      }),
    }),
  );
