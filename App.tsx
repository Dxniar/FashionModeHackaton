import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ClientScreen } from './src/screens/ClientScreen';
import { FranchiseeScreen } from './src/screens/FranchiseeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProductionScreen } from './src/screens/ProductionScreen';
import { createOrder, listOrders, setOrderStatus, subscribeOrders } from './src/lib/ordersApi';
import { isSupabaseConfigured } from './src/lib/supabase';
import type { AppSession, Order } from './src/types';

export default function App() {
  const [session, setSession] = useState<AppSession | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshOrders = async () => {
    try {
      setLoading(true);
      setOrders(await listOrders());
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить заказы. Проверьте настройки Supabase.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshOrders();
    const unsubscribe = subscribeOrders(() => {
      void refreshOrders();
    });
    return unsubscribe;
  }, []);

  const screenTitle = useMemo(() => {
    if (!session) return 'AVISHU SUPERAPP';
    if (session.role === 'CLIENT') return 'CLIENT';
    if (session.role === 'FRANCHISEE') return 'FRANCHISEE';
    return 'PRODUCTION';
  }, [session]);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <LoginScreen onLogin={setSession} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <View>
          <Text style={styles.kicker}>{isSupabaseConfigured ? 'SUPABASE REALTIME' : 'LOCAL DEMO MODE'}</Text>
          <Text style={styles.title}>{screenTitle}</Text>
        </View>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setSession(null)}>
          <Text style={styles.secondaryButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading && <Text style={styles.muted}>LOADING...</Text>}
        {error && <Text style={styles.error}>{error}</Text>}

        {session.role === 'CLIENT' && (
          <ClientScreen
            currentClientName={session.name}
            orders={orders}
            onCreateOrder={async (productName, type, date) => {
              await createOrder({
                product_name: productName,
                type,
                target_ready_date: date,
                client_name: session.name,
              });
              await refreshOrders();
            }}
          />
        )}

        {session.role === 'FRANCHISEE' && (
          <FranchiseeScreen
            orders={orders}
            onSetStatus={async (id, status) => {
              await setOrderStatus(id, status);
              await refreshOrders();
            }}
          />
        )}

        {session.role === 'PRODUCTION' && (
          <ProductionScreen
            orders={orders}
            onSetStatus={async (id, status) => {
              await setOrderStatus(id, status);
              await refreshOrders();
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  topBar: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: 1.8 },
  kicker: { fontSize: 11, letterSpacing: 1.6 },
  secondaryButton: { borderWidth: 1, borderColor: '#000', paddingVertical: 10, paddingHorizontal: 12 },
  secondaryButtonText: { fontSize: 12, fontWeight: '600', letterSpacing: 1.2 },
  scrollContent: { gap: 14, paddingBottom: 28 },
  muted: { opacity: 0.7 },
  error: { borderWidth: 1, borderColor: '#000', color: '#660000', backgroundColor: '#f6f6f6', padding: 8 },
});
