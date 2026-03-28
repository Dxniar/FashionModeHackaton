import type { Order } from '../types';

interface ProductionViewProps {
  orders: Order[];
  onSetStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

export function ProductionView({ orders, onSetStatus }: ProductionViewProps) {
  const queue = orders.filter((order) => order.status === 'SEWING');

  return (
    <div className="stack gap-xl">
      <section className="panel">
        <h3>ОЧЕРЕДЬ ЦЕХА</h3>
        <div className="stack">
          {queue.length === 0 ? (
            <p className="muted">НЕТ АКТИВНЫХ ЗАДАЧ</p>
          ) : (
            queue.map((order) => (
              <article key={order.id} className="task-card">
                <p>{order.product_name}</p>
                <p className="muted">КЛИЕНТ: {order.client_name}</p>
                <button className="big" onClick={() => void onSetStatus(order.id, 'DONE')}>
                  ЗАВЕРШИТЬ
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
