# Nebulabun
Nebulabunは、軽量で多機能なWebViewアプリ作成フレームワークです。
HTML/CSSで描いたUIをそのままアプリに組み込み、ウィンドウ透過やクリック透過、ドラッグなどの操作も簡単に実現できます。
Electronより軽量で、ゲームオーバーレイや便利なデスクトップアプリを手早く作りたい人向けです。

開発速度はとても遅いです。

---

## 開発状況・機能一覧

### 🎯 現在の進捗
このプロジェクトは初期開発段階にあります。基本的なアーキテクチャとビルドシステムは完成していますが、WebView2の完全な実装はまだ進行中です。

### ✅ 実装済み
- [x] プロジェクト構造の設計
- [x] Rust + Bun FFI連携の基盤
- [x] CLI インターフェース
- [x] ビルドシステム
- [x] 基本的なウィンドウ作成

### 🚧 開発中
- [ ] WebView2の完全な実装
- [ ] HTML/CSS レンダリング
- [ ] JavaScript実行・API
- [ ] 透過ウィンドウ
- [ ] クリック透過（下のウィンドウにマウスイベントを通す）

### 📋 今後の予定
- [ ] .draggable 要素でウィンドウ移動
- [ ] .clickable 要素でクリックイベントを反映
- [ ] Bun から DOM 更新可能
- [ ] Bun からイベント制御可能
- [ ] デバッグモード対応
- [ ] ホットリロード
- [ ] パッケージング機能

### 🤝 コントリビューション
このプロジェクトは開発初期段階のため、コントリビューションを歓迎します。特にWebView2の実装に詳しい方のご協力をお待ちしています。


---

## セットアップ

### 必要な環境
- Windows 10/11
- Bun (JavaScript runtime)
- Rust (Cargo)
- WebView2 Runtime

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/your-username/nebulabun.git
cd nebulabun
```

2. 依存関係をインストール
```bash
bun install
```

3. 環境セットアップ
```bash
# 環境確認とセットアップ
bun run setup
```

4. ビルド
```bash
# Rustライブラリをビルド
cd app/rust
cargo build --release
cd ../..

# または一括ビルド（将来実装予定）
# bun run build
```

## 使用方法

### 基本的な使用方法

```bash
# デフォルトアプリを起動（現在は基本ウィンドウのみ）
bun run start

# HTMLファイルを開く（WebView2実装後に利用可能）
bun run start --file ./example.html

# デバッグモードで起動
bun run start --debug

# ヘルプを表示
bun run start --help
```

### 現在の制限事項
- WebView2の完全な実装がまだ完了していないため、HTMLコンテンツは表示されません
- 現在は基本的なウィンドウ作成とFFI連携のテストが可能です
- 透過機能やドラッグ機能は実装中です

### プログラムから使用

```typescript
import { createWindow } from "./app/bun/window";

const window = createWindow({
  title: "My App",
  width: 800,
  height: 600,
  transparent: true
});

const html = `
<!DOCTYPE html>
<html>
<head>
    <title>My Nebulabun App</title>
    <style>
        .draggable { cursor: move; }
        .clickable { cursor: pointer; }
    </style>
</head>
<body>
    <div class="draggable">ドラッグしてウィンドウを移動</div>
    <button class="clickable" onclick="Nebulabun.closeWindow()">閉じる</button>
</body>
</html>
`;

window.startWithHtml(html);
```

### 特殊機能

#### ドラッグ可能な要素
`.draggable` クラスを持つ要素をドラッグしてウィンドウを移動できます。

#### クリック可能な要素
`.clickable` クラスを持つ要素でクリックイベントが有効になります。

#### JavaScript API
ウィンドウ内で `window.Nebulabun` オブジェクトが利用可能です：

```javascript
// 透明度を設定 (0-255)
Nebulabun.setTransparency(128);

// クリック透過を設定
Nebulabun.setClickThrough(true);

// ウィンドウを閉じる
Nebulabun.closeWindow();
```

## アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TypeScript    │    │      Rust       │    │    WebView2     │
│     (Bun)       │◄──►│   (DLL/cdylib)  │◄──►│   (Windows)     │
│                 │    │                 │    │                 │
│ - CLI Interface │    │ - Window Mgmt   │    │ - HTML/CSS/JS   │
│ - FFI Bindings  │    │ - WebView2 API  │    │ - DOM Events    │
│ - Event Handling│    │ - Win32 API     │    │ - Transparency  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

1. **TypeScript (Bun)**: ユーザーインターフェース、CLI、FFI経由でRust関数を呼び出し
2. **Rust (DLL)**: WebView2とWin32 APIの操作、ウィンドウ管理
3. **WebView2**: HTML/CSS/JavaScriptの描画、DOM操作
