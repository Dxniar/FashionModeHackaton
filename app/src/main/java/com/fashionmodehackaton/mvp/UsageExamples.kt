package com.fashionmodehackaton.mvp

import com.google.firebase.firestore.ListenerRegistration

/**
 * Примеры использования FirebaseService для каждой роли.
 *
 * Этот файл демонстрационный: здесь показаны типичные вызовы из ViewModel/Presenter.
 */
class UsageExamples(
    private val service: FirebaseService = FirebaseService()
) {

    private var clientListener: ListenerRegistration? = null
    private var masterListener: ListenerRegistration? = null
    private var franchListener: ListenerRegistration? = null

    // --------------------------------
    // CLIENT
    // --------------------------------

    fun clientFlow(clientId: String) {
        // 1) CLIENT создаёт заказ
        service.createOrderAsClient(
            clientId = clientId,
            title = "Пошив вечернего платья",
            deadline = "2026-04-15",
            onSuccess = { orderId ->
                println("CLIENT: заказ создан, id=$orderId")

                // 2) CLIENT обновляет дедлайн только своего заказа
                service.updateDeadlineAsClient(
                    clientId = clientId,
                    orderId = orderId,
                    newDeadline = "2026-04-20",
                    onSuccess = { println("CLIENT: дедлайн обновлён") },
                    onError = { e -> println("CLIENT: ошибка обновления дедлайна: ${e.message}") }
                )
            },
            onError = { e -> println("CLIENT: ошибка создания заказа: ${e.message}") }
        )

        // 3) CLIENT подписывается на свои заказы в real-time
        clientListener = service.listenClientOrders(
            clientId = clientId,
            onUpdate = { orders ->
                println("CLIENT: получено заказов=${orders.size}")
            },
            onError = { e -> println("CLIENT: ошибка подписки: ${e.message}") }
        )
    }

    // --------------------------------
    // MASTER
    // --------------------------------

    fun masterFlow(masterId: String, orderId: String) {
        // 1) MASTER подписывается на назначенные ему заказы
        masterListener = service.listenMasterOrders(
            masterId = masterId,
            onUpdate = { orders ->
                println("MASTER: моих заказов=${orders.size}")
            },
            onError = { e -> println("MASTER: ошибка подписки: ${e.message}") }
        )

        // 2) MASTER меняет статус своего заказа
        service.updateOrderStatusAsMaster(
            masterId = masterId,
            orderId = orderId,
            newStatus = OrderStatus.IN_PROGRESS,
            onSuccess = { println("MASTER: статус обновлён") },
            onError = { e -> println("MASTER: ошибка смены статуса: ${e.message}") }
        )
    }

    // --------------------------------
    // FRANCH
    // --------------------------------

    fun franchFlow(franchId: String, orderId: String, masterId: String) {
        // 1) FRANCH получает все заказы в real-time
        franchListener = service.listenAllOrdersAsFranch(
            franchId = franchId,
            onUpdate = { orders ->
                println("FRANCH: всего заказов=${orders.size}")
            },
            onError = { e -> println("FRANCH: ошибка подписки: ${e.message}") }
        )

        // 2) FRANCH назначает мастера на заказ
        service.assignMasterToOrderAsFranch(
            franchId = franchId,
            orderId = orderId,
            masterId = masterId,
            onSuccess = { println("FRANCH: мастер назначен") },
            onError = { e -> println("FRANCH: ошибка назначения мастера: ${e.message}") }
        )
    }

    /**
     * Важно отписываться от real-time listeners при уничтожении экрана/VM.
     */
    fun clearListeners() {
        clientListener?.remove()
        masterListener?.remove()
        franchListener?.remove()
    }
}
