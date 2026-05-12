/// Nebulabun API デモ
/// 実行: cd app/zig/zig-out/bin; bun run ../../../bun/demo.ts
import { createWindow } from "./window";

const html = `
<!DOCTYPE html>
<html>
<head>
    <title>My Nebulabun App</title>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: sans-serif;
            text-align: center;
            padding: 40px;
            background: #1a1a2e;
            color: #eee;
        }
        .draggable {
            cursor: move;
            background: #16213e;
            padding: 20px;
            border-radius: 8px;
            user-select: none;
        }
        .clickable {
            cursor: pointer;
            background: #0f3460;
            color: #e94560;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            margin-top: 20px;
        }
        h1 { color: #e94560; }
    </style>
</head>
<body>
    <div class="draggable">👆 ウィンドウを移動するにはここをドラッグしてください</div>
    <h1>Nebulabun WebUI</h1>
    <p>Bun + Zig + WebUI で動いています</p>
    <button class="clickable" onclick="Nebulabun.closeWindow()">閉じる</button>
    <script src="/webui.js"></script>
</body>
</html>
`;

console.log("🚀 Nebulabun 起動中...");

const win = createWindow({
    title: "Nebulabun Demo",
    width: 800,
    height: 600,
    transparent: false,
    frameless: false,
    resizable: true,
    center: true,
});

// startWithHtml はメッセージループを開始するので、その前にサイズ変更などはできない
// （HTML表示中は run_message_loop がブロックする）
console.log("✅ ウィンドウを作成しました");
console.log("📐 API: setSize, setPosition, center, executeJS などが利用可能です");
console.log("   (これらのAPIはメッセージループ中、JavaScript側からのコールバック経由で呼び出します)");

win.startWithHtml(html);
console.log("👋 ウィンドウを閉じました");