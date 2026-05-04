plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(ktorLibs.plugins.ktor)
    alias(libs.plugins.kotlin.serialization)
}

group = "com.example"
version = "1.0.0-SNAPSHOT"

application {
    mainClass = "io.ktor.server.netty.EngineMain"
}

kotlin {
    jvmToolchain(21)
}
dependencies {
    // Ktor 基本
    implementation(ktorLibs.server.core)
    implementation(ktorLibs.server.netty)
    implementation(ktorLibs.server.config.yaml)

    // JSON変換
    implementation(libs.server.content.negotiation)
    implementation(libs.serialization.kotlinx.json)

    // DB: Exposed
    implementation("org.jetbrains.exposed:exposed-core:0.50.0")
    implementation("org.jetbrains.exposed:exposed-dao:0.50.0")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.50.0")

    // DB: Driver
    implementation("org.postgresql:postgresql:42.7.2")

    // Logging
    implementation(libs.logback.classic)

    // Test
    testImplementation(kotlin("test"))
    testImplementation(ktorLibs.server.testHost)

    // Auth & JWT
    implementation(ktorLibs.server.auth)      // ktorLibs形式に統一
    implementation(ktorLibs.server.auth.jwt)  // ktorLibs形式に統一

    // Swagger / OpenAPI / CORS
    // libs.versions.tomlに定義がある場合はこちら
    implementation(ktorLibs.server.openapi)
    implementation(ktorLibs.server.swagger)
    implementation(ktorLibs.server.cors)
}
