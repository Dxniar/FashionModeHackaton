# AVISHU Superapp MVP (Hackathon)

Репозиторий содержит **техническую основу MVP** для хакатона AVISHU: роли, сквозной сценарий, структуру БД, архитектуру, критерии приемки и план демонстрации.

## 1) Цель MVP

Показать сквозной процесс в реальном времени:

1. Клиент создает заказ.
2. Франчайзи видит заказ и переводит его в работу.
3. Производство получает задачу и завершает ее.
4. Клиент автоматически видит статус **ГОТОВО**.

## 2) Роли в едином приложении

- **CLIENT** — витрина, предзаказ, трекинг заказа, лояльность.
- **FRANCHISEE** — дашборд и канбан заказов с real-time обновлениями.
- **PRODUCTION** — промышленный планшетный режим с крупной кнопкой завершения этапа.

## 3) Рекомендуемый стек

- Frontend: React + TypeScript + Tailwind (PWA) или Flutter.
- BaaS: Firebase (Auth + Firestore + Realtime listeners).
- State management: Zustand / Redux Toolkit.

## 4) Минимальная структура проекта

```text
/docs
  architecture.md
  database-schema.md
  user-flows.md
  test-scenario.md
```

## 5) Запуск (для будущей реализации)

После добавления фронтенд-приложения:

```bash
npm install
npm run dev
```

Или для Flutter:

```bash
flutter pub get
flutter run
```

## 6) Что уже описано в репозитории

- Архитектура и роли: `docs/architecture.md`
- Firestore модель данных и статусы: `docs/database-schema.md`
- User flow по ролям: `docs/user-flows.md`
- Сквозной тестовый сценарий для демо: `docs/test-scenario.md`

## 7) Definition of Done (MVP)

- Реализована ролевая маршрутизация после логина.
- Статусы заказа меняются без перезагрузки экрана.
- Весь путь CLIENT → FRANCHISEE → PRODUCTION → CLIENT демонстрируется за 2–3 минуты.
- UI соблюдает черно-белый премиальный минимализм.
