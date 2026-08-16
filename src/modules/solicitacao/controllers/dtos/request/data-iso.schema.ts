import { DateTime } from 'luxon';
import z from 'zod';

export const dataIsoSchema = (mensagem: string) =>
  z.string().refine((valor) => DateTime.fromISO(valor).isValid, {
    message: mensagem,
  });
