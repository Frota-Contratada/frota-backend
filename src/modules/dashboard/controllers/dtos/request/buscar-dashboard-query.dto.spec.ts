import { BuscarDashboardQuerySchema } from './buscar-dashboard-query.dto';

describe('Dashboard organizational filters', () => {
  it('requires a company when a branch code is supplied', () => {
    expect(BuscarDashboardQuerySchema.safeParse({ filial: 10 }).success).toBe(
      false,
    );
    expect(
      BuscarDashboardQuerySchema.safeParse({ empresa: 2, filial: 10 }).success,
    ).toBe(true);
  });

  it('requires a company when a cost center code is supplied', () => {
    expect(
      BuscarDashboardQuerySchema.safeParse({ centroCusto: 4 }).success,
    ).toBe(false);
    expect(
      BuscarDashboardQuerySchema.safeParse({ empresa: 2, centroCusto: 4 })
        .success,
    ).toBe(true);
  });
});
