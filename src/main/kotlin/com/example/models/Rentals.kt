package com.example.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.and

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

    fun rentBook(rental: Rental,)= transaction {

        val isAlreadyRented = Rentals.selectAll()
            .where { Rentals.bookId eq rental.bookId and (Rentals.returnDate.isNull()) }
            .count() > 0
        if (isAlreadyRented) return@transaction null

        Rentals.insert {
            it[bookId] = rental.bookId
            it[userId] = rental.userId
            it[rentalDate] = rental.rentalDate
            it[dueDate] = rental.dueDate
        }get Rentals.id
    }



}