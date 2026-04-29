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