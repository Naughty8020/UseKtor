package com.example

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import com.example.models.Books
import io.ktor.server.request.receive
import com.example.models.Book

fun Application.configureRouting() {
    routing {
        get("/") {
            call.respondText("Hello, World!")
        }
        get("/allBooks") {
            val books = Books.getAllBooks()
            call.respond(books)
        }

        post("/addBooks"){
            val inputJson = call.receive<Book>()
            Books.addBook(inputJson)
            call.respond(inputJson.id)

        }
    }
}