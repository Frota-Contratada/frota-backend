import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { TRACKING_MAX_FUTURE_SKEW_MS } from '../../../domain/tracking.types';

export const TrackingPositionSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  accuracy: z.number().finite().min(0).max(10_000),
  speed: z.number().finite().min(0).max(200),
  heading: z.number().finite().min(0).lt(360),
  timestamp: z.iso
    .datetime({ offset: true })
    .refine(
      (timestamp) =>
        Date.parse(timestamp) <= Date.now() + TRACKING_MAX_FUTURE_SKEW_MS,
      {
        message:
          'O timestamp da posição está muito à frente do relógio do servidor',
      },
    ),
});

export class TrackingPositionRequestDto extends createZodDto(
  TrackingPositionSchema,
) {}
