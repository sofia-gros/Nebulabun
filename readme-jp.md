# Nebulabun
Nebulabunは、WebViewアプリケーションを作成するための軽量で汎用性の高いフレームワークです。  
HTML/CSSで構築したUIをアプリに直接埋め込むことができ、透明ウィンドウ、クリックスルー、ドラッグ操作をサポートします。  
Electronと比較して非常に軽量なため、ゲームオーバーレイや便利なデスクトップユーティリティを素早く作成するのに最適です。  

⚠️ 開発速度は非常に遅いです。 

[日本語はこちら](readme-jp.md)  

---

## 開発状況と機能

### 🎯 現在の進捗
本プロジェクトは初期開発段階です。基本アーキテクチャとビルドシステムは完成していますが、WebView2の完全実装は進行中です。

### ✅ 実装済み
- [x] プロジェクト構造設計
- [x] Zig + Bun FFI基盤
- [x] CLIインターフェース
- [x] ビルドシステム
- [x] 基本ウィンドウ作成

### 🚧 進行中
- [ ] zig-webuiの完全統合
- [ ] zig-webui経由のHTML/CSSレンダリング
- [ ] JavaScript実行とAPI
- [ ] 透過ウィンドウ
- [ ] クリックスルー（マウスイベントを基盤ウィンドウへ転送）

### 📋 計画中
- [ ] ウィンドウ移動用 `.draggable` 要素
- [ ] イベント反映用 `.clickable` 要素
- [ ] Bun からの DOM 更新
- [ ] Bun からのイベント処理
- [ ] デバッグモードサポート
- [ ] ホットリロード
- [ ] 機能パッケージング
- [ ] コミットメッセージガイドライン

### 🤝 貢献
プロジェクトはまだ初期段階のため、特にzig-webuiやWebView実装に精通した方からの貢献を歓迎します。

---

## セットアップ

### 要件
- Windows 10/11  
- Bun (JavaScriptランタイム)  
- Zig (0.16.0以降)  
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

3. 環境設定
```bash
# 環境の確認と設定
bun run setup
```

4. ビルド
```bash
# Zigライブラリのビルド
cd app/zig
zig build dll
cd ../..
# または将来の統合ビルド
# bun run build
```

---

## 使用方法

### 基本操作
```bash
# デフォルトアプリを起動（現時点では基本ウィンドウのみ）
bun run start
# HTMLファイルを開く（WebView2実装後に利用可能）
bun run start --file ./example.html
# デバッグモードで起動
bun run start --debug
# ヘルプ表示
bun run start --help
```

### 現在の制限事項
- HTMLコンテンツのレンダリングはzig-webuiライブラリの実装に依存
- 基本ウィンドウ作成とFFI統合は利用可能
- 透過性とドラッグ機能はzig-webui経由で実装

---

## プログラムによる使用方法

```typescript
import { createWindow } from 「./app/bun/window」;
const window = createWindow({
  title: 「My App」,
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
    <div class="draggable">ウィンドウを移動するにはここをドラッグしてください</div>
    <button class="clickable" onclick="Nebulabun.closeWindow()">閉じる</button>
</body>
</html>
`;
window.startWithHtml(html);
```

---

## 特殊機能

### ドラッグ可能な要素
`.draggable` クラスを持つ要素は、ウィンドウのドラッグに使用できます。

### クリック可能な要素
`.clickable` クラスを持つ要素は、有効なクリックイベントを許可します。

### JavaScript API
ウィンドウ内では、`window.Nebulabun` オブジェクトが利用可能です:

```javascript
// ウィンドウの透明度を設定 (0-255)
Nebulabun.setTransparency(128);
// クリック透過を有効化
Nebulabun.setClickThrough(true);
// ウィンドウを閉じる
Nebulabun.closeWindow();
```

---

## アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TypeScript    │    │      Zig        │    │    WebView2     │
│     (Bun)       │◄──►│   (DLL/so)      │◄──►│   (Windows)     │
│                 │    │                 │    │                 │
│ - CLI Interface │    │ - Window Mgmt   │    │ - HTML/CSS/JS   │
│ - FFI Bindings  │    │ - zig-webui API │    │ - DOM Events    │
│ - Event Handling│    │ - Cross-platform│    │ - Transparency  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

1. **TypeScript (Bun)**: CLI、ユーザー向けインターフェースを提供し、FFI経由でZig関数を呼び出す  
2. **Zig (DLL)**: zig-webuiライブラリ経由でWebView機能を処理し、ウィンドウを管理する  
3. **WebView2**: HTML/CSS/JavaScriptをレンダリングし、DOMイベントを管理する  
