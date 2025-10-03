#!/usr/bin/env bun

import { parseArgs } from "util";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { createWindow, WindowConfig } from "../app/bun/window";

// CLIオプションの定義
const options = {
  help: {
    type: 'boolean' as const,
    short: 'h',
    description: 'ヘルプを表示'
  },
  file: {
    type: 'string' as const,
    short: 'f',
    description: 'HTMLファイルのパス'
  },
  url: {
    type: 'string' as const,
    short: 'u',
    description: '開くURL'
  },
  title: {
    type: 'string' as const,
    short: 't',
    description: 'ウィンドウタイトル'
  },
  width: {
    type: 'string' as const,
    short: 'w',
    description: 'ウィンドウ幅'
  },
  height: {
    type: 'string' as const,
    description: 'ウィンドウ高さ'
  },
  transparent: {
    type: 'boolean' as const,
    description: '透過ウィンドウを有効にする'
  },
  'click-through': {
    type: 'boolean' as const,
    description: 'クリック透過を有効にする'
  },
  transparency: {
    type: 'string' as const,
    description: '透明度 (0-255)'
  },
  debug: {
    type: 'boolean' as const,
    short: 'd',
    description: 'デバッグモードを有効にする'
  }
};

// ヘルプメッセージを表示
function showHelp() {
  console.log(`
Nebulabun - 軽量WebViewアプリフレームワーク

使用方法:
  nebulabun [オプション]

オプション:
  -h, --help              このヘルプを表示
  -f, --file <path>       HTMLファイルを開く
  -u, --url <url>         URLを開く
  -t, --title <title>     ウィンドウタイトルを設定
  -w, --width <width>     ウィンドウ幅を設定
      --height <height>   ウィンドウ高さを設定
      --transparent       透過ウィンドウを有効にする
      --click-through     クリック透過を有効にする
      --transparency <n>  透明度を設定 (0-255)
  -d, --debug             デバッグモードを有効にする

例:
  nebulabun --file ./app.html --width 800 --height 600
  nebulabun --url https://example.com --transparent
  nebulabun --file ./overlay.html --click-through --transparency 200
  `);
}

// デフォルトHTMLコンテンツ
const defaultHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nebulabun App</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        p {
            font-size: 1.2em;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        
        .draggable {
            cursor: move;
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            margin: 10px;
            transition: all 0.3s ease;
        }
        
        .draggable:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        
        .clickable {
            cursor: pointer;
            padding: 10px 20px;
            background: #4CAF50;
            border: none;
            border-radius: 10px;
            color: white;
            font-size: 1em;
            margin: 10px;
            transition: all 0.3s ease;
        }
        
        .clickable:hover {
            background: #45a049;
            transform: scale(1.05);
        }
        
        .controls {
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌟 Nebulabun</h1>
        <p>軽量WebViewアプリフレームワーク</p>
        
        <div class="draggable">
            📱 この部分をドラッグしてウィンドウを移動
        </div>
        
        <div class="controls">
            <button class="clickable" onclick="Nebulabun.setTransparency(128)">
                半透明にする
            </button>
            <button class="clickable" onclick="Nebulabun.setTransparency(255)">
                不透明にする
            </button>
            <button class="clickable" onclick="Nebulabun.closeWindow()">
                閉じる
            </button>
        </div>
    </div>
    
    <script>
        // Nebulabun APIが利用可能になるまで待機
        function waitForNebulabun() {
            if (typeof window.Nebulabun !== 'undefined') {
                console.log('Nebulabun API が利用可能です');
            } else {
                setTimeout(waitForNebulabun, 100);
            }
        }
        waitForNebulabun();
    </script>
</body>
</html>
`;

// メイン関数
async function main() {
  try {
    const { values, positionals } = parseArgs({
      args: process.argv.slice(2),
      options,
      allowPositionals: true
    });

    // ヘルプを表示
    if (values.help) {
      showHelp();
      process.exit(0);
    }

    // デバッグモード
    if (values.debug) {
      console.log('デバッグモード: 有効');
      console.log('引数:', values);
    }

    // ウィンドウ設定を構築
    const config: WindowConfig = {
      title: values.title || 'Nebulabun App',
      width: values.width ? parseInt(values.width) : 800,
      height: values.height ? parseInt(values.height) : 600,
      transparent: values.transparent || false,
      clickThrough: values['click-through'] || false,
      transparency: values.transparency ? parseInt(values.transparency) : 255,
    };

    // ウィンドウを作成
    const window = createWindow(config);

    console.log('Nebulabunアプリを起動中...');
    console.log(`タイトル: ${config.title}`);
    console.log(`サイズ: ${config.width}x${config.height}`);
    
    if (config.transparent) {
      console.log('透過ウィンドウ: 有効');
    }
    
    if (config.clickThrough) {
      console.log('クリック透過: 有効');
    }

    if (values.debug) {
      console.log('デバッグ情報:');
      console.log('- WebView DLLパス:', join(process.cwd(), "app", "rust", "target", "release", "nebulabun_webview.dll"));
      console.log('- 設定:', JSON.stringify(config, null, 2));
    }

    // コンテンツを決定して起動
    let exitCode: number;
    
    if (values.file) {
      // HTMLファイルを開く
      const filePath = resolve(values.file);
      if (!existsSync(filePath)) {
        console.error(`エラー: ファイルが見つかりません: ${filePath}`);
        process.exit(1);
      }
      console.log(`HTMLファイルを開いています: ${filePath}`);
      exitCode = await window.startWithFile(filePath);
    } else if (values.url) {
      // URLを開く
      console.log(`URLを開いています: ${values.url}`);
      exitCode = await window.startWithUrl(values.url);
    } else {
      // デフォルトHTMLを表示
      console.log('デフォルトコンテンツを表示しています');
      exitCode = await window.startWithHtml(defaultHtml);
    }

    console.log('アプリケーションが終了しました');
    process.exit(exitCode);

  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('予期しないエラー:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未処理のPromise拒否:', reason);
  process.exit(1);
});

// メイン関数を実行
if (import.meta.main) {
  main();
}
