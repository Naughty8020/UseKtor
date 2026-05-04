package com.example

import com.example.models.Books
import io.ktor.server.application.Application
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import com.example.models.Users
import com.example.models.Rentals

fun Application.configureDatabases() {
    val config = environment.config
    Database.connect(
        url = config.property("database.url").getString(),
        user = config.property("database.user").getString(),
        password = config.property("database.password").getString()
    )
    transaction {
        SchemaUtils.create(Users, Books, Rentals)
    }
}