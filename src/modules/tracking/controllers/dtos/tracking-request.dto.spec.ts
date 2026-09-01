import { TrackingPositionSchema } from './tracking-request.dto';

describe('TrackingPositionSchema', () => {
  const base = {
    lat: -23.55,
    lng: -46.63,
    accuracy: 5,
    speed: 0,
    heading: 0,
  };

  it('rejeita timestamp muito à frente do relógio do servidor', () => {
    const timestamp = new Date(Date.now() + 10 * 60 * 1_000).toISOString();
    expect(
      TrackingPositionSchema.safeParse({ ...base, timestamp }).success,
    ).toBe(false);
  });

  it('aceita pequena diferença de relógio do dispositivo', () => {
    const timestamp = new Date(Date.now() + 60 * 1_000).toISOString();
    expect(
      TrackingPositionSchema.safeParse({ ...base, timestamp }).success,
    ).toBe(true);
  });
});
