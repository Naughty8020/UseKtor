package com.example.routes

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import com.example.models.Books
import io.ktor.server.request.receive
import com.example.models.Book
import io.ktor.http.HttpStatusCode
import com.example.models.User
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import java.util.Date
import com.example.models.Users
import kotlinx.serialization.Serializable

@Serializable
private data class LoginResponse(val token: String, val userId: Int)


fun Route.bookRouters() {
    route("/books") {
        get("/") {
            call.respondText("Hello, World!")
        }

        post("/auth") {
            val user = call.receive<User>()
            val useId = Users.addUser(user)
            if (useId > 0) {
                call.respond(HttpStatusCode.Created, "User registered successfully")
            } else {
                call.respond(HttpStatusCode.InternalServerError, "Failed to register user")
            }
        }


        post("/login") {
            val user = call.receive<User>()
            val userRecord = Users.findByUsernameWithId(user.username)
            if (userRecord != null && userRecord.second == user.password) {
                val secret = environment.config.property("jwt.secret").getString()
                val issuer = environment.config.property("jwt.issuer").getString()
                val audience = environment.config.property("jwt.audience").getString()

                val token = JWT.create()
                    .withAudience(audience)
                    .withIssuer(issuer)
                    .withClaim("username", user.username)
                    .withClaim("userId", userRecord.first)
                    .withExpiresAt(Date(System.currentTimeMillis() + 600000))
                    .sign(Algorithm.HMAC256(secret))

                call.respond(LoginResponse(token = token, userId = userRecord.first))
            } else {
                call.respond(HttpStatusCode.Unauthorized, "Invalid username or password")
            }
        }

        authenticate("auth-jwt") {
            get("/allBooks") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.getClaim("userId")?.asInt()
                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized, "Invalid token")
                    return@get
                }
                val books = Books.getBooksByOwner(userId)
                call.respond(books)
            }

            post("/addBooks") {
                val inputJson = call.receive<Book>()
                Books.addBook(inputJson)
                call.respond(HttpStatusCode.Created, "Book added successfully")
            }

            put("/{id}") {
                val id = call.parameters["id"]?.toInt()
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, "ID is required")
                    return@put
                }
                val inputJson = call.receive<Book>()
                if (Books.updateBook(id, inputJson) > 0) {
                    call.respond(HttpStatusCode.OK, "Book updated successfully")
                } else {
                    call.respond(HttpStatusCode.NotFound, "Book not found")
                }
            }

            delete("/{id}") {
                val id = call.parameters["id"]?.toInt()
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, "ID is required")
                    return@delete
                }
                if (Books.deleteBook(id) > 0) {
                    call.respond(HttpStatusCode.OK, "Book deleted successfully")
                } else {
                    call.respond(HttpStatusCode.NotFound, "Book not found")
                }
            }
        }
    }
}