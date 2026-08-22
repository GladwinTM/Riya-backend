export interface RequestUser {
  id: string;
  email?: string;
  role?: 'CUSTOMER' | 'ADMIN';
}
