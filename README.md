### AIの出力によるktorのベストプラクティス？
```bash
src/main/kotlin/com/example/
├── Application.kt          # サーバー起動とプラグイン設定の起点
├── plugins/                # 設定（Routing, Serializationなど）を分離
│   ├── Routing.kt
│   ├── Serialization.kt
│   └── Security.kt
├── routes/                 # エンドポイントの定義（Controller相当）
│   ├── UserRoutes.kt
│   └── OrderRoutes.kt
├── models/                 # データ構造 (data class)
│   └── User.kt
├── repository/             # データベース操作 (Exposedなどを使用)
│   └── UserRepository.kt
└── services/               # ビジネスロジック（複雑な計算や判定）
    └── UserService.kt
```

---
### 1. 認証・認可 (Authentication & Authorization)
``` bash
curl -X POST "http://0.0.0.0:8080/books/auth" \
-H "Content-Type: application/json" \
-d '{"username": "admin", "password": "password123"}'
```

*   **ログイン (トークン取得)**
    ```bash
    curl -X POST "http://0.0.0.0:8080/books/login" \
         -H "Content-Type: application/json" \
         -d '{"username": "admin", "password": "password123"}'
    ```
    > **Note:** 返ってきた `"token": "..."` の値を、以下の `YOUR_TOKEN` 部分に差し替えてください。

---

### 2. 本の操作（要JWT認証）
1. 前準備：変数のセット
   ログイン時に取得したトークンをセットしてください。

Bash
export TOKEN="あなたのJWTトークン"
2. CRUD操作のテストコマンド
   【C】Create：本を追加する
   ownerId が必要です。ここでは admin ユーザー（ID: 1 と想定）が所有者として登録する例です。

Bash
curl -X POST "http://0.0.0.0:8080/books/addBooks" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
"id": 0,
"title": "Kotlin入門",
"author": "山田太郎",
"ownerId": 1
}'
【R】Read：本の一覧を取得する
登録した内容が ownerId 込みで返ってくるか確認します。

Bash
curl -X GET "http://0.0.0.0:8080/books/allBooks" \
-H "Authorization: Bearer $TOKEN"
【U】Update：本の情報を更新する
IDを指定して更新します（例として ID: 1 を指定）。現在の updateBook の実装では title と author が更新対象です。

Bash
curl -X PUT "http://0.0.0.0:8080/books/1" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
"id": 1,
"title": "Kotlin実践ガイド",
"author": "山田次郎",
"ownerId": 1
}'
【D】Delete：本を削除する
指定したIDの本を削除します。

Bash
curl -X DELETE "http://0.0.0.0:8080/books/1" \
-H "Authorization: Bearer $TOKEN"

### 💡 補足
今の `bookそのコードの構成（`route("/books")` で括られている状態）に基づいた、正しい `curl` コマンドをまとめました。

すべてのパスは `/books` から始まるようになっている点に注意してください。

---

## 🚀 Ktor Book API リファレンス

### 1. 認証・ユーザー管理
これらは認証なしで叩けます。

*   **ユーザー登録**
    ```bash
    curl -X POST "http://0.0.0.0:8080/books/auth" \
         -H "Content-Type: application/json" \
         -d '{"username": "tamura", "password": "password123"}'
    ```

*   **ログイン (トークン取得)**
    ```bash
    curl -X POST "http://0.0.0.0:8080/books/login" \
         -H "Content-Type: application/json" \
         -d '{"username": "tamura", "password": "password123"}'
    ```
    > **Note:** 返ってきた `"token": "..."` の値を、以下の `YOUR_TOKEN` 部分に差し替えてください。

---

### 2. 本の操作（要JWT認証）
ここからはヘッダーに `Authorization: Bearer <TOKEN>` が必要です。

*   **本の一覧取得**
    ```bash
    curl -H "Authorization: Bearer YOUR_TOKEN" \
         "http://0.0.0.0:8080/books/allBooks"
    ```

*   **本の追加**
    ```bash
    curl -X POST "http://0.0.0.0:8080/books/addBooks" \
         -H "Authorization: Bearer YOUR_TOKEN" \
         -H "Content-Type: application/json" \
         -d '{
           "id": 0,
           "title": "Kotlin入門",
           "author": "JetBrains",
           "ownerId": 1
         }'
    ```

*   **本の更新 (ID指定)**
    ```bash
    curl -X PUT "http://0.0.0.0:8080/books/1" \
         -H "Authorization: Bearer YOUR_TOKEN" \
         -H "Content-Type: application/json" \
         -d '{
           "id": 1,
           "title": "Kotlin入門 改訂版",
           "author": "JetBrains",
           "ownerId": 1
         }'
    ```

*   **本の削除 (ID指定)**
    ```bash
    curl -X DELETE "http://0.0.0.0:8080/books/1" \
         -H "Authorization: Bearer YOUR_TOKEN"
    ```

---

### 3. その他
*   **ヘルスチェック**
    ```bash
    curl "http://0.0.0.0:8080/books/"
    ```

---

### 💡 補足
今の `bookRouters` の定義だと、すべてのエンドポイントの先頭に `/books` が付きます。
もし `[http://0.0.0.0:80](http://0.0.0.0:80)そのコードの構成（`route("/books")` で括られている状態）に基づいた、正しい `curl` コマンドをまとめました。

すべてのパスは `/books` から始まるようになっている点に注意してください。

---

## 🚀 Ktor Book API リファレンス

### 1. 認証・ユーザー管理
これらは認証なしで叩けます。

*   **ユーザー登録**
    ```bash
    curl -X POST "http://0.0.0.0:8080/books/auth" \
         -H "Content-Type: application/json" \
         -d '{"username": "tamura", "password": "password123"}'
    ```

*   **ログイン (トークン取得)**
    ```bash
    curl -X POST "http://0.0.0.0:8080/books/login" \
         -H "Content-Type: application/json" \
         -d '{"username": "tamura", "password": "password123"}'
    ```
    > **Note:** 返ってきた `"token": "..."` の値を、以下の `YOUR_TOKEN` 部分に差し替えてください。

---

### 2. 本の操作（要JWT認証）
ここからはヘッダーに `Authorization: Bearer <TOKEN>` が必要です。

*   **本の一覧取得**
    ```bash
    curl -H "Authorization: Bearer YOUR_TOKEN" \
         "http://0.0.0.0:8080/books/allBooks"
    ```

*   **本の追加**
    ```bash
    curl -X POST "http://0.0.0.0:8080/books/addBooks" \
         -H "Authorization: Bearer YOUR_TOKEN" \
         -H "Content-Type: application/json" \
         -d '{
           "id": 0,
           "title": "Kotlin入門",
           "author": "JetBrains",
           "ownerId": 1
         }'
    ```

*   **本の更新 (ID指定)**
    ```bash
    curl -X PUT "http://0.0.0.0:8080/books/1" \
         -H "Authorization: Bearer YOUR_TOKEN" \
         -H "Content-Type: application/json" \
         -d '{
           "id": 1,
           "title": "Kotlin入門 改訂版",
           "author": "JetBrains",
           "ownerId": 1
         }'
    ```

*   **本の削除 (ID指定)**
    ```bash
    curl -X DELETE "http://0.0.0.0:8080/books/1" \
         -H "Authorization: Bearer YOUR_TOKEN"
    ```

---

### 3. その他
*   **ヘルスチェック**
    ```bash
    curl "http://0.0.0.0:8080/books/"
    ```

---

### 💡 補足
今の `bookRouters` の定義だと、すべてのエンドポイントの先頭に `/books` が付きます。
もし `[http://0.0.0.0:8080/auth](http://0.0.0.0:8080/auth)` のように `/books` を挟みたくない場合は、コード内の `route("/books") { ... }` の外に `post("/auth")` などを移動させる必要があります。今のままであれば、上記の `curl` コマンドが正解です！
