import type { Order } from '../types';

interface FranchiseeViewProps {
  orders: Order[];
  onSetStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

const columns: Array<{ title: string; status: Order['status'] }> = [
  { title: 'НОВЫЕ', status: 'PLACED' },
  { title: 'В РАБОТЕ', status: 'IN_PROGRESS' },
  { title: 'ЦЕХ', status: 'SEWING' },
  { title: 'ГОТОВО', status: 'DONE' },
];

export function FranchiseeView({ orders, onSetStatus }: FranchiseeViewProps) {
  const todayRevenue = orders.length * 55000;
  const planRate = Math.min((orders.filter((x) => x.status === 'DONE').length / 10) * 100, 100);

  return (
    <div className="stack gap-xl">
      <section className="panel metrics">
        <article>
          <p className="kicker">ВЫРУЧКА СЕГОДНЯ</p>
          <strong>{todayRevenue.toLocaleString('ru-RU')} ₸</strong>
        </article>
        <article>
          <p className="kicker">ВЫПОЛНЕНИЕ ПЛАНА</p>
          <strong>{planRate.toFixed(0)}%</strong>
        </article>
      </section>

      <section className="panel">
        <h3>ORDER BOARD</h3>
        <div className="kanban">
          {columns.map((column) => (
            <div key={column.status} className="kanban-col">
              <h4>{column.title}</h4>
              {orders
                .filter((order) => order.status === column.status)
                .map((order) => (
                  <article key={order.id} className="card">
                    <p>{order.product_name}</p>
                    <p className="muted">{order.client_name}</p>

                    {order.status === 'PLACED' && (
                      <button onClick={() => void onSetStatus(order.id, 'IN_PROGRESS')}>ПРИНЯТЬ</button>
                    )}
                    {order.status === 'IN_PROGRESS' && (
                      <button onClick={() => void onSetStatus(order.id, 'SEWING')}>В ЦЕХ</button>
                    )}
                  </article>
                ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
