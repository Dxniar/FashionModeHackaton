# AVISHU Superapp MVP (React + Supabase)

MVP мобильного супераппа AVISHU с ролевым интерфейсом:

- **CLIENT** — витрина, заказ/предзаказ, трекинг и лояльность.
- **FRANCHISEE** — дашборд и real-time канбан заказов.
- **PRODUCTION** — промышленный интерфейс цеха с крупной кнопкой завершения.

## Что реализовано

- Единый экран входа и маршрутизация по роли.
- Сквозной workflow: `PLACED → IN_PROGRESS → SEWING → DONE`.
- Real-time синхронизация через Supabase Realtime (`postgres_changes`).
- Черно-белый премиальный UI (минимализм, верхний регистр, тонкие линии).
- Fallback-режим без Supabase (локальное хранилище + BroadcastChannel) для быстрой демо-проверки.

## Стек

- React + TypeScript + Vite
- Supabase (Database + Realtime)

## Быстрый старт

```bash
npm install
cp .env.example .env
npm run dev
```

Откройте `http://localhost:5173`.

## Настройка Supabase

1. Создайте проект в Supabase.
2. Выполните SQL из `supabase-schema.sql` в SQL Editor.
3. Скопируйте `Project URL` и `anon key` в `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

4. Убедитесь, что Realtime включен для таблицы `orders`.

## Демо сквозного сценария

1. Откройте приложение в 3 вкладках/устройствах.
2. Войдите как CLIENT / FRANCHISEE / PRODUCTION.
3. CLIENT создает заказ.
4. FRANCHISEE принимает (`IN_PROGRESS`) и отправляет в цех (`SEWING`).
5. PRODUCTION нажимает **ЗАВЕРШИТЬ** (`DONE`).
6. CLIENT видит обновленный статус автоматически.

## Структура

```text
src/
  components/
    LoginScreen.tsx
    ClientView.tsx
    FranchiseeView.tsx
    ProductionView.tsx
  lib/
    supabase.ts
    ordersApi.ts
  App.tsx
  styles.css
  types.ts
supabase-schema.sql
```

## Замечание по безопасности

В `supabase-schema.sql` включена открытая MVP policy для хакатона. Перед продом обязательно внедрить строгий RLS с Auth + role-based policies.
