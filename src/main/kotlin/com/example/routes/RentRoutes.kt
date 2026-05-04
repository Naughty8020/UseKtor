package com.example.routes


import io.ktor.server.request.receive
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import com.example.models.Rental
import com.example.models.Rentals
import io.ktor.server.auth.authenticate


fun Route.rentRoutes () {
    route ("/rent")  {
        get("/"){
            call.respondText("Welcome to the Book Rental Service!")
        }

        authenticate ("auth-jwt"){
            post ("/rentBook") {
                val rentalBook = call.receive<Rental>()
                Rentals.rentBook(
                    targetBookId = rentalBook.bookId,
                    targetUserId = rentalBook.userId,
                    rentalDateValue = rentalBook.rentalDate,
                    dueDateValue = rentalBook.dueDate
                )
                call.respondText("Book rented successfully!")
            }
        }

    }
}