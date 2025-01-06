export type ActionData = {
  error?: string;
  success?: boolean;
  fields?: Record<string, unknown>;
} | undefined;

export interface User {
  id: string;
  userId?: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface PageState {
  isLoading: boolean;
}