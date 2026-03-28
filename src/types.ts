export type UserRole = 'CLIENT' | 'FRANCHISEE' | 'PRODUCTION';

export type OrderStatus = 'PLACED' | 'IN_PROGRESS' | 'SEWING' | 'DONE';
export type OrderType = 'IN_STOCK' | 'PREORDER';

export interface Order {
  id: string;
  product_name: string;
  type: OrderType;
  target_ready_date: string | null;
  client_name: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface AppSession {
  name: string;
  role: UserRole;
}
