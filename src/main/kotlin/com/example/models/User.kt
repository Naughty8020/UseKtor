package com.example.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.insert

@Serializable
data class User(
    val username: String,
    val password: String
)

object Users : Table("Users"){
    val id = integer("id").autoIncrement()
    val username = varchar("username", 255).uniqueIndex()
    val passwordHash = varchar("password_hash", 255)
    override val primaryKey = PrimaryKey(id)

    fun findByUsername(username: String): String? = transaction {
        Users.selectAll().where { Users.username eq username }
            .map { it[Users.passwordHash] }
            .singleOrNull()
    }

    fun findByUsernameWithId(username: String): Pair<Int, String>? = transaction {
        Users.selectAll().where { Users.username eq username }
            .map { Pair(it[Users.id], it[Users.passwordHash]) }
            .singleOrNull()
    }

    fun addUser(user: User): Int = transaction {
        Users.insert {
            it[username] = user.username
            it[passwordHash] = user.password
        } get Users.id
    }
}


