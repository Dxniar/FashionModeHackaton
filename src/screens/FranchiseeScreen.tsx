import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Order } from '../types';

interface FranchiseeScreenProps {
  orders: Order[];
  onSetStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

const columns: Array<{ title: string; status: Order['status'] }> = [
  { title: 'НОВЫЕ', status: 'PLACED' },
  { title: 'В РАБОТЕ', status: 'IN_PROGRESS' },
  { title: 'ЦЕХ', status: 'SEWING' },
  { title: 'ГОТОВО', status: 'DONE' },
];

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

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.kanbanRow}>
          {columns.map((column) => {
            const columnOrders = orders.filter((order) => order.status === column.status);

            return (
              <View key={column.status} style={styles.column}>
                <Text style={styles.columnTitle}>{column.title}</Text>
                {columnOrders.length === 0 ? <Text style={styles.emptyText}>ПУСТО</Text> : null}

                {columnOrders.map((order) => (
                  <View key={order.id} style={styles.card}>
                    <Text style={styles.title}>{order.product_name}</Text>
                    <Text>{order.client_name}</Text>

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
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  metricsRow: { flexDirection: 'row', gap: 8 },
  metricCard: { flex: 1, borderWidth: 1, borderColor: '#000', padding: 12, gap: 8 },
  metricValue: { fontSize: 20, fontWeight: '700', letterSpacing: 1.2 },
  kanbanRow: { flexDirection: 'row', gap: 10 },
  column: { width: 230, borderWidth: 1, borderColor: '#000', padding: 10, gap: 8 },
  columnTitle: { fontWeight: '700', letterSpacing: 1.1, fontSize: 12 },
  emptyText: { opacity: 0.5, fontSize: 12 },
  card: { borderWidth: 1, borderColor: '#000', padding: 10, gap: 8 },
  title: { fontWeight: '700', fontSize: 14 },
  kicker: { fontSize: 11, letterSpacing: 1.2 },
  button: { borderWidth: 1, borderColor: '#000', backgroundColor: '#000', padding: 10 },
  buttonText: { color: '#fff', textAlign: 'center', letterSpacing: 1.1 },
});
