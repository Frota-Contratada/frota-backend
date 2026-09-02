import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { TrackingPositionSchema } from './tracking-position-request.dto';

export const RecalcularRotaSchema = z.object({
  position: TrackingPositionSchema,
});

export class RecalcularRotaRequestDto extends createZodDto(
  RecalcularRotaSchema,
) {}
