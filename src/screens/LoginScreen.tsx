import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { AppSession, UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (session: AppSession) => void;
}

const roles: UserRole[] = ['CLIENT', 'FRANCHISEE', 'PRODUCTION'];

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('CLIENT');

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>AVISHU SUPERAPP</Text>
      <Text style={styles.title}>LOGIN</Text>

      <Text style={styles.label}>USER NAME</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="ENTER NAME"
        style={styles.input}
        placeholderTextColor="#777"
      />

      <Text style={styles.label}>ROLE</Text>
      <View style={styles.rolesRow}>
        {roles.map((item) => (
          <Pressable key={item} style={[styles.roleButton, item === role && styles.roleButtonActive]} onPress={() => setRole(item)}>
            <Text style={[styles.roleText, item === role && styles.roleTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.submit}
        onPress={() => {
          if (!name.trim()) return;
          onLogin({ name: name.trim().toUpperCase(), role });
        }}
      >
        <Text style={styles.submitText}>ENTER</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: '#000', padding: 16, gap: 10 },
  kicker: { fontSize: 11, letterSpacing: 1.5 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: 1.6 },
  label: { fontSize: 12, letterSpacing: 1.1, marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#000', paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  rolesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  roleButton: { borderWidth: 1, borderColor: '#000', paddingHorizontal: 10, paddingVertical: 8 },
  roleButtonActive: { backgroundColor: '#000' },
  roleText: { fontSize: 12, letterSpacing: 1 },
  roleTextActive: { color: '#fff' },
  submit: { borderWidth: 1, borderColor: '#000', padding: 12, marginTop: 6, backgroundColor: '#000' },
  submitText: { color: '#fff', textAlign: 'center', fontWeight: '700', letterSpacing: 1.3 },
});
