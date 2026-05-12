/// Nebulabun API デモ
/// 実行: bun run app/bun/demo.ts
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
    <script>
        // webui.js を使った JavaScript API の例
        document.title = "Nebulabun Demo";
    </script>
</body>
</html>
`;

console.log("🚀 Nebulabun 起動中...");
const window = createWindow({
    title: "Nebulabun Demo",
    width: 800,
    height: 600,
    transparent: false,
});
window.startWithHtml(html);
console.log("👋 ウィンドウを閉じました");