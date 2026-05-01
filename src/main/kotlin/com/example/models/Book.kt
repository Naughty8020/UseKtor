package com.example.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.jetbrains.exposed.sql.deleteWhere

@Serializable
data class Book(
    val id: Int,
    val title: String,
    val author: String
)

object Books : Table("books") {
    val id = integer("id").autoIncrement()
    val title = varchar("title", 255)
    val author = varchar("author", 255)
    override val primaryKey = PrimaryKey(id)

    fun addBook(book: Book): Int = transaction {
        Books.insert {
            it[title] = book.title
            it[author] = book.author
        } get Books.id
    }

    fun getAllBooks(): List<Book> = transaction {
        Books.selectAll().map {
            Book(
                id = it[Books.id],
                title = it[Books.title],
                author = it[Books.author]
            )
        }
    }

    fun updateBook(id: Int, updatedBook: Book): Int = transaction{
    Books.update({ Books.id eq id }) {
        it[title] = updatedBook.title
        it[author] = updatedBook.author
    }
    }

    fun deleteBook(id: Int): Int = transaction {
        Books.deleteWhere { Books.id eq id }
    }

}