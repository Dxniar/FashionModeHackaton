import { useState } from 'react';
import type { AppSession, UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (session: AppSession) => void;
}

const roles: UserRole[] = ['CLIENT', 'FRANCHISEE', 'PRODUCTION'];

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('CLIENT');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onLogin({ name: name.trim().toUpperCase(), role });
  };

  return (
    <main className="screen center">
      <section className="panel auth">
        <p className="kicker">AVISHU SUPERAPP</p>
        <h1>LOGIN</h1>
        <form onSubmit={submit} className="stack">
          <label>
            USER NAME
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="ENTER NAME"
              maxLength={30}
            />
          </label>

          <label>
            ROLE
            <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <button type="submit">ENTER</button>
        </form>
      </section>
    </main>
  );
}
