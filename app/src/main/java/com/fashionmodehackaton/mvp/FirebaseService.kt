package com.fashionmodehackaton.mvp

import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration

/**
 * Сервис работы с Firebase Firestore для MVP суперприложения швейного производства.
 *
 * Включает:
 * - CRUD (Create, Read, Update) для заказов
 * - проверки ролей перед операциями
 * - real-time подписки через addSnapshotListener
 */
class FirebaseService(
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
) {

    private val usersCollection = db.collection("users")
    private val ordersCollection = db.collection("orders")

    // ----------------------------
    // Вспомогательные методы
    // ----------------------------

    /**
     * Получить пользователя по id и вернуть объект User в callback.
     */
    private fun getUserById(
        userId: String,
        onSuccess: (User) -> Unit,
        onError: (Exception) -> Unit
    ) {
        usersCollection.document(userId).get()
            .addOnSuccessListener { doc ->
                if (!doc.exists()) {
                    onError(IllegalStateException("Пользователь $userId не найден"))
                    return@addOnSuccessListener
                }
                onSuccess(doc.toUser())
            }
            .addOnFailureListener(onError)
    }

    /**
     * Проверка, что пользователь имеет ожидаемую роль.
     */
    private fun requireRole(
        userId: String,
        expectedRole: UserRole,
        onAllowed: () -> Unit,
        onError: (Exception) -> Unit
    ) {
        getUserById(
            userId = userId,
            onSuccess = { user ->
                if (user.role != expectedRole.name) {
                    onError(
                        IllegalAccessException(
                            "Доступ запрещён: user=$userId role=${user.role}, ожидается ${expectedRole.name}"
                        )
                    )
                } else {
                    onAllowed()
                }
            },
            onError = onError
        )
    }

    // ----------------------------
    // CLIENT: Create + Read
    // ----------------------------

    /**
     * CLIENT: создать новый заказ.
     *
     * Ограничение:
     * - только пользователь с ролью CLIENT может создавать заказ
     * - поле client у заказа всегда ставится равным clientId
     */
    fun createOrderAsClient(
        clientId: String,
        title: String,
        deadline: String,
        onSuccess: (String) -> Unit,
        onError: (Exception) -> Unit
    ) {
        requireRole(clientId, UserRole.CLIENT, onAllowed = {
            val orderData = hashMapOf(
                "title" to title,
                "client" to clientId,
                "master" to "",
                "status" to OrderStatus.CREATED.name,
                "deadline" to deadline
            )

            ordersCollection.add(orderData)
                .addOnSuccessListener { ref -> onSuccess(ref.id) }
                .addOnFailureListener(onError)
        }, onError = onError)
    }

    /**
     * CLIENT: real-time получение только своих заказов.
     */
    fun listenClientOrders(
        clientId: String,
        onUpdate: (List<Order>) -> Unit,
        onError: (Exception) -> Unit
    ): ListenerRegistration {
        return ordersCollection
            .whereEqualTo("client", clientId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    onError(error)
                    return@addSnapshotListener
                }
                val orders = snapshot?.documents.orEmpty().map { it.toOrder() }
                onUpdate(orders)
            }
    }

    // ----------------------------
    // MASTER: Read + Update статуса
    // ----------------------------

    /**
     * MASTER: real-time получение своих назначенных заказов.
     */
    fun listenMasterOrders(
        masterId: String,
        onUpdate: (List<Order>) -> Unit,
        onError: (Exception) -> Unit
    ): ListenerRegistration {
        return ordersCollection
            .whereEqualTo("master", masterId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    onError(error)
                    return@addSnapshotListener
                }
                val orders = snapshot?.documents.orEmpty().map { it.toOrder() }
                onUpdate(orders)
            }
    }

    /**
     * MASTER: изменить статус заказа, если заказ назначен именно этому мастеру.
     */
    fun updateOrderStatusAsMaster(
        masterId: String,
        orderId: String,
        newStatus: OrderStatus,
        onSuccess: () -> Unit,
        onError: (Exception) -> Unit
    ) {
        requireRole(masterId, UserRole.MASTER, onAllowed = {
            ordersCollection.document(orderId).get()
                .addOnSuccessListener { doc ->
                    if (!doc.exists()) {
                        onError(IllegalStateException("Заказ $orderId не найден"))
                        return@addOnSuccessListener
                    }
                    val order = doc.toOrder()
                    if (order.master != masterId) {
                        onError(
                            IllegalAccessException(
                                "Мастер $masterId не может менять заказ $orderId (назначен: ${order.master})"
                            )
                        )
                        return@addOnSuccessListener
                    }

                    ordersCollection.document(orderId)
                        .update("status", newStatus.name)
                        .addOnSuccessListener { onSuccess() }
                        .addOnFailureListener(onError)
                }
                .addOnFailureListener(onError)
        }, onError = onError)
    }

    // ----------------------------
    // FRANCH: Read all + assign master
    // ----------------------------

    /**
     * FRANCH: real-time получение всех заказов.
     */
    fun listenAllOrdersAsFranch(
        franchId: String,
        onUpdate: (List<Order>) -> Unit,
        onError: (Exception) -> Unit
    ): ListenerRegistration {
        // Проверяем роль один раз перед подпиской.
        // Для production можно добавить более строгую server-side security rules.
        var listenerRegistration: ListenerRegistration? = null
        requireRole(franchId, UserRole.FRANCH, onAllowed = {
            listenerRegistration = ordersCollection
                .addSnapshotListener { snapshot, error ->
                    if (error != null) {
                        onError(error)
                        return@addSnapshotListener
                    }
                    val orders = snapshot?.documents.orEmpty().map { it.toOrder() }
                    onUpdate(orders)
                }
        }, onError = onError)

        // Возвращаем no-op listener, если роль не прошла.
        return listenerRegistration ?: ListenerRegistration { }
    }

    /**
     * FRANCH: назначить мастера на заказ.
     *
     * Ограничения:
     * - операцию выполняет только FRANCH
     * - назначаемый пользователь должен иметь роль MASTER
     */
    fun assignMasterToOrderAsFranch(
        franchId: String,
        orderId: String,
        masterId: String,
        onSuccess: () -> Unit,
        onError: (Exception) -> Unit
    ) {
        requireRole(franchId, UserRole.FRANCH, onAllowed = {
            // Проверяем, что назначаемый пользователь — мастер.
            requireRole(masterId, UserRole.MASTER, onAllowed = {
                ordersCollection.document(orderId)
                    .update(
                        mapOf(
                            "master" to masterId,
                            "status" to OrderStatus.ASSIGNED.name
                        )
                    )
                    .addOnSuccessListener { onSuccess() }
                    .addOnFailureListener(onError)
            }, onError = onError)
        }, onError = onError)
    }

    // ----------------------------
    // Общие методы чтения (Read) и обновления (Update)
    // ----------------------------

    /**
     * Получить заказ по id (одноразовое чтение).
     */
    fun getOrderById(
        orderId: String,
        onSuccess: (Order) -> Unit,
        onError: (Exception) -> Unit
    ) {
        ordersCollection.document(orderId).get()
            .addOnSuccessListener { doc ->
                if (!doc.exists()) {
                    onError(IllegalStateException("Заказ $orderId не найден"))
                    return@addOnSuccessListener
                }
                onSuccess(doc.toOrder())
            }
            .addOnFailureListener(onError)
    }

    /**
     * Обновить дедлайн заказа (пример Update).
     * CLIENT может менять только свои заказы.
     */
    fun updateDeadlineAsClient(
        clientId: String,
        orderId: String,
        newDeadline: String,
        onSuccess: () -> Unit,
        onError: (Exception) -> Unit
    ) {
        requireRole(clientId, UserRole.CLIENT, onAllowed = {
            ordersCollection.document(orderId).get()
                .addOnSuccessListener { doc ->
                    if (!doc.exists()) {
                        onError(IllegalStateException("Заказ $orderId не найден"))
                        return@addOnSuccessListener
                    }
                    val order = doc.toOrder()
                    if (order.client != clientId) {
                        onError(
                            IllegalAccessException(
                                "Клиент $clientId не может менять чужой заказ $orderId"
                            )
                        )
                        return@addOnSuccessListener
                    }

                    ordersCollection.document(orderId)
                        .update("deadline", newDeadline)
                        .addOnSuccessListener { onSuccess() }
                        .addOnFailureListener(onError)
                }
                .addOnFailureListener(onError)
        }, onError = onError)
    }
}

/**
 * Конвертер Firestore документа в User.
 */
private fun DocumentSnapshot.toUser(): User {
    return User(
        id = id,
        name = getString("name") ?: "",
        role = getString("role") ?: UserRole.CLIENT.name
    )
}

/**
 * Конвертер Firestore документа в Order.
 */
private fun DocumentSnapshot.toOrder(): Order {
    return Order(
        id = id,
        title = getString("title") ?: "",
        client = getString("client") ?: "",
        master = getString("master") ?: "",
        status = getString("status") ?: OrderStatus.CREATED.name,
        deadline = getString("deadline") ?: ""
    )
}
