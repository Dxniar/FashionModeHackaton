import type { Order, OrderStatus, OrderType } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

type OrderInsert = {
  product_name: string;
  type: OrderType;
  target_ready_date: string | null;
  client_name: string;
  status: OrderStatus;
};

const listeners = new Set<() => void>();

const memoryStore: Order[] = [
  {
    id: String(Date.now()),
    product_name: 'AVISHU BLACK BLAZER',
    type: 'IN_STOCK',
    target_ready_date: null,
    client_name: 'DEMO CLIENT',
    status: 'PLACED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function notifyLocalListeners() {
  for (const listener of listeners) listener();
}

function sortOrders(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
}

export async function listOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('id,product_name,type,target_ready_date,client_name,status,created_at,updated_at')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return data satisfies Order[];
  }

  return sortOrders(memoryStore);
}

export async function createOrder(payload: Omit<OrderInsert, 'status'>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('orders').insert({ ...payload, status: 'PLACED' });
    if (error) throw error;
    return;
  }

  const now = new Date().toISOString();
  memoryStore.push({
    id: `${Date.now()}-${Math.random()}`,
    ...payload,
    status: 'PLACED',
    created_at: now,
    updated_at: now,
  });
  notifyLocalListeners();
}

export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) throw error;
    return;
  }

  const order = memoryStore.find((item) => item.id === orderId);
  if (!order) return;

  order.status = status;
  order.updated_at = new Date().toISOString();
  notifyLocalListeners();
}

export function subscribeOrders(onChange: () => void): () => void {
  listeners.add(onChange);

  if (isSupabaseConfigured && supabase) {
    const channel = supabase
      .channel('orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, onChange)
      .subscribe();

    return () => {
      listeners.delete(onChange);
      void supabase.removeChannel(channel);
    };
  }

  return () => {
    listeners.delete(onChange);
  };
}
