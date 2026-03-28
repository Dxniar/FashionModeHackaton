import { useMemo, useState } from 'react';
import type { Order } from '../types';

const products = [
  { id: '1', name: 'BLACK COAT', type: 'IN_STOCK' as const },
  { id: '2', name: 'WOOL DRESS', type: 'PREORDER' as const },
  { id: '3', name: 'MONOCHROME SHIRT', type: 'IN_STOCK' as const },
];

interface ClientViewProps {
  orders: Order[];
  currentClientName: string;
  onCreateOrder: (productName: string, type: 'IN_STOCK' | 'PREORDER', date: string | null) => Promise<void>;
}

const orderStatusLabel: Record<Order['status'], string> = {
  PLACED: 'ОФОРМЛЕН',
  IN_PROGRESS: 'В РАБОТЕ',
  SEWING: 'ПОШИВ',
  DONE: 'ГОТОВО',
};

export function ClientView({ orders, currentClientName, onCreateOrder }: ClientViewProps) {
  const [productForPreorder, setProductForPreorder] = useState<string | null>(null);
  const [readyDate, setReadyDate] = useState('');

  const myOrders = useMemo(
    () => orders.filter((order) => order.client_name === currentClientName),
    [orders, currentClientName],
  );

  const activeOrder = myOrders[0];
  const doneOrders = myOrders.filter((order) => order.status === 'DONE').length;
  const loyaltyProgress = Math.min((doneOrders / 5) * 100, 100);

  return (
    <div className="stack gap-xl">
      <section className="panel banner">
        <p className="kicker">NEW COLLECTION</p>
        <h2>MONOCHROME DROP</h2>
      </section>

      <section className="panel">
        <h3>CATALOG</h3>
        <div className="grid">
          {products.map((product) => (
            <article key={product.id} className="card">
              <p>{product.name}</p>
              {product.type === 'IN_STOCK' ? (
                <button onClick={() => void onCreateOrder(product.name, 'IN_STOCK', null)}>КУПИТЬ</button>
              ) : (
                <button onClick={() => setProductForPreorder(product.name)}>ОФОРМИТЬ ПРЕДЗАКАЗ</button>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>АКТИВНЫЙ ЗАКАЗ</h3>
        {activeOrder ? (
          <div className="tracking">
            <p>{activeOrder.product_name}</p>
            <div className="steps">
              {(['PLACED', 'SEWING', 'DONE'] as const).map((step) => (
                <span
                  key={step}
                  className={
                    ['PLACED', 'IN_PROGRESS', 'SEWING', 'DONE'].indexOf(activeOrder.status) >=
                    ['PLACED', 'SEWING', 'DONE'].indexOf(step)
                      ? 'step active'
                      : 'step'
                  }
                >
                  {orderStatusLabel[step]}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="muted">НЕТ АКТИВНЫХ ЗАКАЗОВ</p>
        )}
      </section>

      <section className="panel">
        <h3>ЛОЯЛЬНОСТЬ</h3>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${loyaltyProgress}%` }} />
        </div>
        <p className="muted">{doneOrders} / 5 заказов до следующего бонуса</p>
      </section>

      {productForPreorder && (
        <div className="modal">
          <div className="panel modal-panel">
            <h3>ПРЕДЗАКАЗ</h3>
            <p>{productForPreorder}</p>
            <label>
              ДАТА ГОТОВНОСТИ
              <input type="date" value={readyDate} onChange={(event) => setReadyDate(event.target.value)} />
            </label>
            <div className="actions">
              <button
                onClick={() => {
                  if (!readyDate) return;
                  void onCreateOrder(productForPreorder, 'PREORDER', readyDate);
                  setProductForPreorder(null);
                  setReadyDate('');
                }}
              >
                ПОДТВЕРДИТЬ
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setProductForPreorder(null);
                  setReadyDate('');
                }}
              >
                ОТМЕНА
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
