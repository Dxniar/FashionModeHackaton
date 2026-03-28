import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Order } from '../types';

interface FranchiseeScreenProps {
  orders: Order[];
  onSetStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

export function FranchiseeScreen({ orders, onSetStatus }: FranchiseeScreenProps) {
  const todayRevenue = orders.length * 55000;
  const done = orders.filter((order) => order.status === 'DONE').length;

  return (
    <View style={styles.wrapper}>
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.kicker}>ВЫРУЧКА</Text>
          <Text style={styles.metricValue}>{todayRevenue.toLocaleString('ru-RU')} ₸</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.kicker}>ПЛАН</Text>
          <Text style={styles.metricValue}>{Math.min(done * 10, 100)}%</Text>
        </View>
      </View>

      <View style={styles.board}>
        {orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Text style={styles.title}>{order.product_name}</Text>
            <Text>{order.client_name}</Text>
            <Text style={styles.kicker}>{order.status}</Text>

            {order.status === 'PLACED' && (
              <Pressable style={styles.button} onPress={() => void onSetStatus(order.id, 'IN_PROGRESS')}>
                <Text style={styles.buttonText}>ПРИНЯТЬ</Text>
              </Pressable>
            )}
            {order.status === 'IN_PROGRESS' && (
              <Pressable style={styles.button} onPress={() => void onSetStatus(order.id, 'SEWING')}>
                <Text style={styles.buttonText}>В ЦЕХ</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  metricsRow: { flexDirection: 'row', gap: 8 },
  metricCard: { flex: 1, borderWidth: 1, borderColor: '#000', padding: 12, gap: 8 },
  metricValue: { fontSize: 20, fontWeight: '700', letterSpacing: 1.2 },
  board: { gap: 8 },
  card: { borderWidth: 1, borderColor: '#000', padding: 12, gap: 8 },
  title: { fontWeight: '700', fontSize: 14 },
  kicker: { fontSize: 11, letterSpacing: 1.2 },
  button: { borderWidth: 1, borderColor: '#000', backgroundColor: '#000', padding: 10 },
  buttonText: { color: '#fff', textAlign: 'center', letterSpacing: 1.1 },
});
