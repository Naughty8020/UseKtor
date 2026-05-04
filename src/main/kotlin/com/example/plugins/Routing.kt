package com.example.plugins
import io.ktor.server.application.Application
import io.ktor.server.routing.routing
import com.example.routes.rentRoutes
import com.example.routes.bookRouters


fun Application.configureRouting() {
    routing {
        rentRoutes()
        bookRouters()
    }
}