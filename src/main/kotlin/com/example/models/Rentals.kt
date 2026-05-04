package com.example.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.update

@Serializable
data class Rental(
    val id: Int,
    val bookId: Int,
    val userId: Int,
    val rentalDate: String,
    val dueDate: String,
    val returnDate: String? = null
)

object Rentals : Table("rentals") {
    val id = integer("id").autoIncrement()
    val bookId = reference("book_id", Books.id)
    val userId = reference("user_id", Users.id)
    val rentalDate = varchar("rental_date", 20)
    val dueDate = varchar("due_date", 20)
    val returnDate = varchar("return_date", 20).nullable()

    override val primaryKey = PrimaryKey(id)

    fun rentBook(
        targetBookId: Int,
        targetUserId: Int,
        rentalDateValue: String,
        dueDateValue: String): Int? = transaction {
        val isAlreadyRented = Rentals.selectAll()
            .where { Rentals.bookId eq targetBookId and (Rentals.returnDate.isNull()) }
            .count() > 0
        if (isAlreadyRented) return@transaction null

        Rentals.insert {
            it[bookId] = targetBookId
            it[userId] = targetUserId
            it[rentalDate] = rentalDateValue
            it[dueDate] = dueDateValue
        }get Rentals.id
    }

    fun returnBook(rentalId: Int,rentalDateValue: String) =  transaction {
        Rentals.update({ Rentals.id eq rentalId }) {
            it[Rentals.returnDate] = rentalDateValue
        }
    }

    fun getAllHistory(targetUserId: Int):List<Rental> = transaction {
        Rentals.selectAll()
            .where { Rentals.userId eq targetUserId }
            .map {
                Rental(
                    id = it[Rentals.id],
                    bookId = it[Rentals.bookId],
                    userId = it[Rentals.userId],
                    rentalDate = it[Rentals.rentalDate],
                    dueDate = it[Rentals.dueDate],
                    returnDate = it[Rentals.returnDate]
                )
            }

    }


}