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
### 📚 Book Rental System API Reference
Ktorで構築した本管理および貸出管理システムのAPI仕様書です。

### 🔑 認証 (Authentication)
一部のエンドポイントを除き、JWTによる認証が必要です。

### ユーザー登録
```bash
curl -X POST "http://0.0.0.0:8080/books/auth" \
-H "Content-Type: application/json" \
-d '{"username": "admin", "password": "password123"}'
```

### ログイン (トークン取得)
```bash
curl -X POST "http://0.0.0.0:8080/books/login" \
-H "Content-Type: application/json" \
-d '{"username": "admin", "password": "password123"}'
```

### 返却された token を環境変数等に保存して使用してください。
```bash
export TOKEN="取得したトークン"
```

### 📖 本の管理 (Books API)
#### 全てのパスは /books から始まります。

### 本の一覧取得
```bash
curl -H "Authorization: Bearer $TOKEN" "http://0.0.0.0:8080/books/allBooks"
```

### 本の追加
```bash
curl -X POST "http://0.0.0.0:8080/books/addBooks" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{"id": 0, "title": "Kotlin入門", "author": "山田太郎", "ownerId": 1}'
```

### 本の更新 (ID指定)
```bash
curl -X PUT "http://0.0.0.0:8080/books/{id}" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{"id": 1, "title": "Kotlin実践ガイド", "author": "山田次郎", "ownerId": 1}'
```

### 本の削除 (ID指定)
```bash
curl -X DELETE "http://0.0.0.0:8080/books/{id}" -H "Authorization: Bearer $TOKEN"
```
### 🤝 貸出管理 (Rental API)
#### 全てのパスは /rent から始まります。

### 本を借りる
```bash
curl -X POST "http://0.0.0.0:8080/rent/rentBook" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
"id": 0,
"bookId": 3,
"userId": 1,
"rentalDate": "2026-05-04",
"dueDate": "2026-05-18",
"returnDate": null
}'
```

### 本を返却する
#### id には rentals テーブルの ID（履歴取得で確認可能）を指定します。

```bash
curl -X POST "http://0.0.0.0:8080/rent/returnBook" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
"id": 7,
"bookId": 0,
"userId": 0,
"rentalDate": "2026-05-05",
"dueDate": "",
"returnDate": "2026-05-05"
}'
```

### ユーザーごとの貸出履歴取得
```bash
curl -H "Authorization: Bearer $TOKEN" "http://0.0.0.0:8080/rent/history/{userId}"
```
