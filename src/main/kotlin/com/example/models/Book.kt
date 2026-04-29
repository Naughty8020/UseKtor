package com.example.models

import kotlinx.serialization.Serializable

@Serializable
enum class Genre {
    FICTION, NON_FICTION, SCIENCE_FICTION, FANTASY, MYSTERY, BIOGRAPHY
}

@Serializable
data class Book(
    val id: Int,
    val title: String,
    val author: String,
    val publishedYear: Int,
    var genre: Genre
)

object Books {

    private val books = mutableListOf(
        Book(1, "The Great Gatsby", "F. Scott Fitzgerald", 1925, Genre.FICTION),
        Book(2, "To Kill a Mockingbird", "Harper Lee", 1960, Genre.FICTION),
        Book(3, "1984", "George Orwell", 1949, Genre.SCIENCE_FICTION)
    )

    fun addBook(book: Book) {
        books.add(book)
    }

    fun getAllBooks(): List<Book> {
        return books
    }

    fun getBookById(id: Int): Book? {
        return books.find { it.id == id }
    }

    fun updateBook(id: Int, updatedBook: Book): Boolean {
        val index = books.indexOfFirst { it.id == id }
        return if (index != -1) {
            books[index] = updatedBook
            true
        } else {
            false
        }
    }

    fun deleteBook(id: Int): Boolean {
        return books.removeIf { it.id == id }
    }

}