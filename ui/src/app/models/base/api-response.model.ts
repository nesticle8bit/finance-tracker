export interface ApiResponse<T> {
  status: number;
  errors: string[] | null;
  data: T | null;
}
