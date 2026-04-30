package com.example.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction

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



//    fun getBookById(id: Int): Book? {
//        return books.find { it.id == id }
//    }
//
//    fun updateBook(id: Int, updatedBook: Book): Boolean {
//        val index = books.indexOfFirst { it.id == id }
//        return if (index != -1) {
//            books[index] = updatedBook
//            true
//        } else {
//            false
//        }
//    }
//
//    fun deleteBook(id: Int): Boolean {
//        return books.removeIf { it.id == id }
//    }

}