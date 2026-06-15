export interface PaginatedResponseInterface<T> {
  totalCount: number;
  hasNextPage: boolean;
  data: T[];
}
