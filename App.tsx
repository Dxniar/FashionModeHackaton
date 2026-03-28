import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ClientScreen } from './src/screens/ClientScreen';
import { FranchiseeScreen } from './src/screens/FranchiseeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProductionScreen } from './src/screens/ProductionScreen';
import { createOrder, listOrders, setOrderStatus, subscribeOrders } from './src/lib/ordersApi';
import { isSupabaseConfigured } from './src/lib/supabase';
import type { AppSession, Order } from './src/types';

function AppContent() {
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
    if (session.role === 'CLIENT') return 'CLIENT MODE';
    if (session.role === 'FRANCHISEE') return 'FRANCHISEE CONTROL';
    return 'PRODUCTION TABLET';
  }, [session]);

  if (!session) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" translucent={false} />
        <LoginScreen onLogin={setSession} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" translucent={false} />
      <View style={styles.topBar}>
        <View style={styles.topBarInfo}>
          <Text style={styles.kicker}>{isSupabaseConfigured ? 'SUPABASE REALTIME' : 'LOCAL DEMO MODE'}</Text>
          <Text style={styles.title}>{screenTitle}</Text>
          <Text style={styles.userName}>{session.name}</Text>
        </View>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setSession(null)}>
          <Text style={styles.secondaryButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refreshOrders()} tintColor="#000" />}
      >
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

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  topBar: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  topBarInfo: { flexShrink: 1, gap: 4 },
  title: { fontSize: 20, fontWeight: '700', letterSpacing: 1.4 },
  kicker: { fontSize: 11, letterSpacing: 1.4 },
  userName: { fontSize: 12, letterSpacing: 1.2, opacity: 0.75 },
  secondaryButton: { borderWidth: 1, borderColor: '#000', paddingVertical: 10, paddingHorizontal: 12 },
  secondaryButtonText: { fontSize: 12, fontWeight: '600', letterSpacing: 1.2 },
  scrollContent: { gap: 14, paddingBottom: 28 },
  error: { borderWidth: 1, borderColor: '#000', color: '#660000', backgroundColor: '#f6f6f6', padding: 8 },
});
