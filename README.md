# Nebulabun
Nebulabunは、軽量で多機能なWebViewアプリ作成フレームワークです。
HTML/CSSで描いたUIをそのままアプリに組み込み、ウィンドウ透過やクリック透過、ドラッグなどの操作も簡単に実現できます。
Electronより軽量で、ゲームオーバーレイや便利なデスクトップアプリを手早く作りたい人向けです。

開発速度はとても遅いです。

---

## できること
- [ ] 透過ウィンドウ
- [ ] 背景透過可能
- [ ] クリック透過（下のウィンドウにマウスイベントを通す）
- [ ] HTML/CSS 描画
- [ ] WebView2 を使用
- [ ] 背景色透明に設定可能
- [ ] 要素ごとの操作
- [ ] .draggable 要素でウィンドウ移動
- [ ] .clickable 要素でクリックイベントを反映
- [ ] 透過部分はクリック無効
- [ ] Bun 連携
- [ ] Bun から DOM 更新可能
- [ ] Bun からイベント制御可能
- [ ] 開発者向け
- [ ] CLI で簡単起動
- [ ] デバッグモード対応

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

3. ビルド
```bash
# Windows
build.bat

# または手動で
bun run build
```

## 使用方法

### 基本的な使用方法

```bash
# デフォルトアプリを起動
bun run start

# HTMLファイルを開く
bun run start --file ./your-app.html

# URLを開く
bun run start --url https://example.com

# 透過ウィンドウで起動
bun run start --transparent --width 400 --height 300
```

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

## 開発状況

現在実装済みの機能：
- [x] 基本的なWebView2ウィンドウ作成
- [x] HTML/URL読み込み
- [x] 透過ウィンドウ
- [x] クリック透過
- [x] JavaScript実行
- [x] FFI連携
- [x] CLI インターフェース

今後実装予定：
- [ ] ドラッグ機能の完全実装
- [ ] イベントハンドリングの拡張
- [ ] デバッグモード
- [ ] ホットリロード
- [ ] パッケージング機能

ドキュメントは今後整備していく予定です。
