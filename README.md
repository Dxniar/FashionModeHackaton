# AVISHU Superapp MVP (Android • React Native + Supabase)

Это **Android MVP** под ТЗ хакатона AVISHU на стеке **React Native (Expo) + Supabase**.

## Реализовано

- Единый экран входа с выбором роли: `CLIENT`, `FRANCHISEE`, `PRODUCTION`.
- Ролевые интерфейсы:
  - CLIENT: витрина, покупка/предзаказ, трекинг и лояльность.
  - FRANCHISEE: базовые метрики и управление статусами заказа.
  - PRODUCTION: очередь цеха и крупная кнопка «ЗАВЕРШИТЬ».
- Сквозной сценарий статусов: `PLACED -> IN_PROGRESS -> SEWING -> DONE`.
- Real-time подписка на изменения заказов через Supabase Realtime.
- Fallback локального демо-режима, если Supabase не настроен.

## Запуск на Android

```bash
npm install
cp .env.example .env
npm run android
```

> Нужен установленный Android Studio Emulator или физическое Android-устройство с Expo Go.

## Переменные окружения

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Настройка Supabase

1. Создайте проект в Supabase.
2. Запустите SQL из `supabase-schema.sql`.
3. Включите Realtime для таблицы `orders`.

## Сценарий демо

1. Откройте приложение в 3 сессиях (эмуляторы/устройства).
2. CLIENT создает заказ.
3. FRANCHISEE переводит заказ в `IN_PROGRESS`, затем в `SEWING`.
4. PRODUCTION завершает заказ (`DONE`).
5. CLIENT видит обновление статуса автоматически.

## Ограничение репозитория

В репозитории намеренно **нет бинарных файлов** (иконки/сплэш). Если нужно, добавьте их локально в `assets/` и пропишите пути в `app.json`.

## Важно

`supabase-schema.sql` включает открытый policy для хакатонного MVP. Перед production обязательны строгие RLS-политики по ролям.
