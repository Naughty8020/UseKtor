package com.example.plugins

import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.swagger.*
import io.ktor.server.routing.*
import io.ktor.http.*

fun Application.configureSwagger() {
    // Swagger UIからAPIを叩けるようにCORSを許可
    install(CORS) {
        anyHost()
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
    }

    routing {
        // resources直下の openapi.yaml を参照してUIを表示
        swaggerUI(path = "swagger", swaggerFile = "openapi.yaml")
    }
}