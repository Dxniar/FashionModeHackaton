import { useEffect, useMemo, useState } from 'react';
import { ClientView } from './components/ClientView';
import { FranchiseeView } from './components/FranchiseeView';
import { LoginScreen } from './components/LoginScreen';
import { ProductionView } from './components/ProductionView';
import { createOrder, listOrders, setOrderStatus, subscribeOrders } from './lib/ordersApi';
import { isSupabaseConfigured } from './lib/supabase';
import type { AppSession, Order } from './types';

function App() {
  const [session, setSession] = useState<AppSession | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await listOrders();
      setOrders(data);
      setError(null);
    } catch (loadError) {
      console.error(loadError);
      setError('Не удалось загрузить заказы. Проверьте конфигурацию Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
    const unsubscribe = subscribeOrders(() => {
      void loadOrders();
    });

    return () => unsubscribe();
  }, []);

  const headerTitle = useMemo(() => {
    if (!session) return 'AVISHU SUPERAPP';
    if (session.role === 'CLIENT') return 'CLIENT MODE';
    if (session.role === 'FRANCHISEE') return 'FRANCHISEE CONTROL';
    return 'PRODUCTION TABLET';
  }, [session]);

  if (!session) {
    return <LoginScreen onLogin={setSession} />;
  }

  return (
    <main className="screen">
      <header className="topbar">
        <div>
          <p className="kicker">{isSupabaseConfigured ? 'SUPABASE REALTIME' : 'LOCAL FALLBACK MODE'}</p>
          <h1>{headerTitle}</h1>
        </div>
        <div className="actions">
          <span className="user-chip">{session.name}</span>
          <button className="secondary" onClick={() => setSession(null)}>
            LOGOUT
          </button>
        </div>
      </header>

      {loading ? <p className="muted">LOADING...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {session.role === 'CLIENT' && (
        <ClientView
          orders={orders}
          currentClientName={session.name}
          onCreateOrder={async (productName, type, date) => {
            await createOrder({
              product_name: productName,
              type,
              target_ready_date: date,
              client_name: session.name,
            });
            await loadOrders();
          }}
        />
      )}

      {session.role === 'FRANCHISEE' && (
        <FranchiseeView
          orders={orders}
          onSetStatus={async (orderId, status) => {
            await setOrderStatus(orderId, status);
            await loadOrders();
          }}
        />
      )}

      {session.role === 'PRODUCTION' && (
        <ProductionView
          orders={orders}
          onSetStatus={async (orderId, status) => {
            await setOrderStatus(orderId, status);
            await loadOrders();
          }}
        />
      )}
    </main>
  );
}

export default App;
