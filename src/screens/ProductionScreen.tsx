import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Order } from '../types';

interface ProductionScreenProps {
  orders: Order[];
  onSetStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

export function ProductionScreen({ orders, onSetStatus }: ProductionScreenProps) {
  const queue = orders.filter((order) => order.status === 'SEWING');

  return (
    <View style={styles.wrapper}>
      <View style={styles.block}>
        <Text style={styles.title}>ОЧЕРЕДЬ ЦЕХА</Text>
        <Text style={styles.counter}>ЗАДАЧ В ОЧЕРЕДИ: {queue.length}</Text>

        {queue.length === 0 ? (
          <Text style={styles.muted}>НЕТ АКТИВНЫХ ЗАДАЧ</Text>
        ) : (
          queue.map((order) => (
            <View key={order.id} style={styles.card}>
              <Text style={styles.orderName}>{order.product_name}</Text>
              <Text style={styles.muted}>КЛИЕНТ: {order.client_name}</Text>
              <Pressable style={styles.bigButton} onPress={() => void onSetStatus(order.id, 'DONE')}>
                <Text style={styles.bigButtonText}>ЗАВЕРШИТЬ</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  block: { borderWidth: 1, borderColor: '#000', padding: 12, gap: 8 },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: 1.2 },
  counter: { fontSize: 12, letterSpacing: 1.1, opacity: 0.75 },
  card: { borderWidth: 1, borderColor: '#000', padding: 12, gap: 8 },
  orderName: { fontWeight: '700' },
  muted: { opacity: 0.7 },
  bigButton: { borderWidth: 1, borderColor: '#000', backgroundColor: '#000', paddingVertical: 16 },
  bigButtonText: { color: '#fff', textAlign: 'center', fontWeight: '700', letterSpacing: 1.2 },
});
