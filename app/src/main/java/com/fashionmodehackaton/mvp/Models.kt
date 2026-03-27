package com.fashionmodehackaton.mvp

/**
 * Роли пользователей в MVP.
 */
enum class UserRole {
    CLIENT,
    MASTER,
    FRANCH
}

/**
 * Модель пользователя в коллекции users.
 *
 * users/{userId}:
 * {
 *   "name": string,
 *   "role": string
 * }
 */
data class User(
    val id: String = "", // document id
    val name: String = "",
    val role: String = UserRole.CLIENT.name
)

/**
 * Возможные статусы заказа для упрощения контроля значений.
 */
enum class OrderStatus {
    CREATED,
    ASSIGNED,
    IN_PROGRESS,
    READY,
    DONE,
    CANCELED
}

/**
 * Модель заказа в коллекции orders.
 *
 * orders/{orderId}:
 * {
 *   "title": string,
 *   "client": string,
 *   "master": string,
 *   "status": string,
 *   "deadline": string
 * }
 */
data class Order(
    val id: String = "", // document id
    val title: String = "",
    val client: String = "",  // userId клиента
    val master: String = "",  // userId мастера
    val status: String = OrderStatus.CREATED.name,
    val deadline: String = ""  // ISO дата строкой, например "2026-04-10"
)
