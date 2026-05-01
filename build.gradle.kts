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

    // JSON変換 (libs. に統一)
    implementation(libs.server.content.negotiation)
    implementation(libs.serialization.kotlinx.json)

    // DB: Exposed (バージョン管理が libs.versions.toml にあるなら libs. で統一)
    // もし libs. でエラーが出るなら、直接文字列で書く方だけ残せばOKです
    implementation("org.jetbrains.exposed:exposed-core:0.50.0")
    implementation("org.jetbrains.exposed:exposed-dao:0.50.0")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.50.0")

    // DB: Driver
    implementation("org.postgresql:postgresql:42.7.2")
    // implementation(libs.h2) // Postgres一本で行くならH2は消してもOK

    // Logging
    implementation(libs.logback.classic)

    // Test
    testImplementation(kotlin("test"))
    testImplementation(ktorLibs.server.testHost)

    implementation("io.ktor:ktor-server-auth-jvm")
    implementation("io.ktor:ktor-server-auth-jwt-jvm")
}
