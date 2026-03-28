import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Order } from '../types';

interface ClientScreenProps {
  orders: Order[];
  currentClientName: string;
  onCreateOrder: (productName: string, type: 'IN_STOCK' | 'PREORDER', date: string | null) => Promise<void>;
}

const products = [
  { id: '1', name: 'BLACK COAT', type: 'IN_STOCK' as const },
  { id: '2', name: 'WOOL DRESS', type: 'PREORDER' as const },
  { id: '3', name: 'MONOCHROME SHIRT', type: 'IN_STOCK' as const },
];

const orderStatusLabel: Record<Order['status'], string> = {
  PLACED: 'ОФОРМЛЕН',
  IN_PROGRESS: 'В РАБОТЕ',
  SEWING: 'ПОШИВ',
  DONE: 'ГОТОВО',
};

export function ClientScreen({ orders, currentClientName, onCreateOrder }: ClientScreenProps) {
  const [selectedPreorder, setSelectedPreorder] = useState<string | null>(null);
  const [readyDate, setReadyDate] = useState('');

  const myOrders = useMemo(() => orders.filter((item) => item.client_name === currentClientName), [orders, currentClientName]);
  const activeOrder = myOrders[0];
  const doneOrders = myOrders.filter((order) => order.status === 'DONE').length;
  const progress = Math.min((doneOrders / 5) * 100, 100);

  return (
    <View style={styles.wrapper}>
      <View style={styles.block}>
        <Text style={styles.kicker}>NEW COLLECTION</Text>
        <Text style={styles.title}>MONOCHROME DROP</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.sectionTitle}>CATALOG</Text>
        {products.map((product) => (
          <View key={product.id} style={styles.card}>
            <Text style={styles.itemTitle}>{product.name}</Text>
            {product.type === 'IN_STOCK' ? (
              <Pressable style={styles.btn} onPress={() => void onCreateOrder(product.name, 'IN_STOCK', null)}>
                <Text style={styles.btnText}>КУПИТЬ</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.btn} onPress={() => setSelectedPreorder(product.name)}>
                <Text style={styles.btnText}>ПРЕДЗАКАЗ</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <View style={styles.block}>
        <Text style={styles.sectionTitle}>АКТИВНЫЙ ЗАКАЗ</Text>
        {activeOrder ? (
          <>
            <Text style={styles.itemTitle}>{activeOrder.product_name}</Text>
            <Text style={styles.muted}>{orderStatusLabel[activeOrder.status]}</Text>
          </>
        ) : (
          <Text style={styles.muted}>НЕТ АКТИВНЫХ ЗАКАЗОВ</Text>
        )}
      </View>

      <View style={styles.block}>
        <Text style={styles.sectionTitle}>ЛОЯЛЬНОСТЬ</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.muted}>{doneOrders}/5</Text>
      </View>

      <Modal visible={Boolean(selectedPreorder)} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>ПРЕДЗАКАЗ</Text>
            <Text style={styles.itemTitle}>{selectedPreorder}</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={readyDate}
              onChangeText={setReadyDate}
              style={styles.input}
              placeholderTextColor="#777"
            />
            <Pressable
              style={styles.btn}
              onPress={() => {
                if (!selectedPreorder || !readyDate) return;
                void onCreateOrder(selectedPreorder, 'PREORDER', readyDate);
                setSelectedPreorder(null);
                setReadyDate('');
              }}
            >
              <Text style={styles.btnText}>ПОДТВЕРДИТЬ</Text>
            </Pressable>
            <Pressable style={styles.btnGhost} onPress={() => setSelectedPreorder(null)}>
              <Text style={styles.btnGhostText}>ОТМЕНА</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  block: { borderWidth: 1, borderColor: '#000', padding: 12, gap: 8 },
  kicker: { fontSize: 11, letterSpacing: 1.5 },
  title: { fontSize: 20, fontWeight: '700', letterSpacing: 1.3 },
  sectionTitle: { fontSize: 14, letterSpacing: 1.2, fontWeight: '700' },
  card: { borderWidth: 1, borderColor: '#000', padding: 10, gap: 8 },
  itemTitle: { fontSize: 15, fontWeight: '600' },
  btn: { borderWidth: 1, borderColor: '#000', backgroundColor: '#000', padding: 10 },
  btnText: { color: '#fff', textAlign: 'center', letterSpacing: 1.1 },
  btnGhost: { borderWidth: 1, borderColor: '#000', padding: 10 },
  btnGhostText: { textAlign: 'center', letterSpacing: 1.1 },
  muted: { opacity: 0.7 },
  progressTrack: { height: 14, borderWidth: 1, borderColor: '#000' },
  progressFill: { height: '100%', backgroundColor: '#000' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#000', padding: 14, gap: 8 },
  input: { borderWidth: 1, borderColor: '#000', paddingHorizontal: 10, paddingVertical: 9 },
});
