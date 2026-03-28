# Структура базы данных (Firebase Firestore)

## 1. Коллекция `users`

Документ: `users/{uid}`

```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "role": "CLIENT | FRANCHISEE | PRODUCTION",
  "franchiseId": "string | null",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 2. Коллекция `orders`

Документ: `orders/{orderId}`

```json
{
  "orderId": "string",
  "clientId": "uid",
  "franchiseId": "string",
  "productId": "string",
  "productName": "string",
  "type": "IN_STOCK | PREORDER",
  "targetReadyDate": "timestamp | null",
  "status": "PLACED | IN_PROGRESS | SEWING | DONE",
  "price": 0,
  "currency": "KZT",
  "loyaltyPointsEarned": 0,
  "timeline": [
    {
      "status": "PLACED",
      "at": "timestamp",
      "by": "uid"
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 3. Индексы

1. `orders`: `franchiseId + status + updatedAt(desc)`
2. `orders`: `clientId + updatedAt(desc)`
3. `orders`: `status + updatedAt(desc)` для очереди цеха

## 4. Правила доступа (MVP)

- CLIENT:
  - может читать только свои заказы (`resource.data.clientId == request.auth.uid`)
  - может создавать заказ
- FRANCHISEE:
  - читает заказы своей франшизы
  - меняет `PLACED -> IN_PROGRESS -> SEWING`
- PRODUCTION:
  - читает заказы со статусом `SEWING`
  - меняет `SEWING -> DONE`

## 5. Рекомендуемый жизненный цикл документа

1. Client creates order with `PLACED`.
2. Franchisee confirms: `IN_PROGRESS`.
3. Transfer to workshop: `SEWING`.
4. Seamstress completes: `DONE`.
