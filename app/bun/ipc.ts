import { FFIType, dlopen, suffix } from "bun:ffi";

import { join } from "path";

// Zig DLLのパス
const libPath = join(process.cwd(), "app", "zig", "zig-out", "bin", `nebulabun_webview.${suffix}`);

    // FFI関数の型定義
    const lib = dlopen(libPath, {
        // WebView2ウィンドウ作成
        create_webview_window: {
            args: [FFIType.cstring, FFIType.i32, FFIType.i32, FFIType.i32],
            returns: FFIType.i32,
        },
        
        // HTMLコンテンツ設定
        set_html_content: {
            args: [FFIType.cstring],
            returns: FFIType.i32,
        },
        
        // URL移動
        navigate_to_url: {
            args: [FFIType.cstring],
            returns: FFIType.i32,
        },
        
        // JavaScript実行
        execute_javascript: {
            args: [FFIType.cstring],
            returns: FFIType.i32,
        },
        
        // ウィンドウ透明度設定
        set_window_transparency: {
            args: [FFIType.i32],
            returns: FFIType.i32,
        },
        
        // クリック透過設定
        set_click_through: {
            args: [FFIType.i32],
            returns: FFIType.i32,
        },
        
        // ウィンドウを閉じる
        close_window: {
            args: [],
            returns: FFIType.i32,
        },
        
        // メッセージループ実行
        run_message_loop: {
            args: [],
            returns: FFIType.i32,
        },
        
        // HTMLファイル読み込み
        load_html_file: {
            args: [FFIType.cstring],
            returns: FFIType.i32,
        },
    });

    // WebViewクラス - Zig関数のラッパー
    export class WebView {
        private windowHandle: number = 0;
        
        /**
         * WebViewウィンドウを作成
         * @param title ウィンドウタイトル
         * @param width ウィンドウ幅
         * @param height ウィンドウ高さ
         * @param transparent 透過ウィンドウかどうか
         */
        createWindow(title: string = "Nebulabun App", width: number = 800, height: number = 600, transparent: boolean = false): boolean {
            const titlePtr = Buffer.from(title + '\0', 'utf8');
            // 呼び出しが失敗した場合 (0 が返された場合) のチェックを追加
            this.windowHandle = lib.symbols.create_webview_window(titlePtr, width, height, transparent ? 1 : 0);
            
            if (this.windowHandle === 0) {
                console.error("FFI Error: create_webview_window が失敗しました。Zig DLLのビルドとパスを確認してください:", libPath);
            }
            return this.windowHandle !== 0;
        }
        
        /**
         * HTMLコンテンツを設定
         * @param html HTMLコンテンツ
         */
        setHtmlContent(html: string): boolean {
            const htmlPtr = Buffer.from(html + '\0', 'utf8');
            return lib.symbols.set_html_content(htmlPtr) === 1;
        }
        
        /**
         * 指定URLに移動
         * @param url 移動先URL
         */
        navigateToUrl(url: string): boolean {
            const urlPtr = Buffer.from(url + '\0', 'utf8');
            return lib.symbols.navigate_to_url(urlPtr) === 1;
        }
        
        /**
         * JavaScriptを実行
         * @param script 実行するJavaScriptコード
         */
        executeJavaScript(script: string): boolean {
            const scriptPtr = Buffer.from(script + '\0', 'utf8');
            return lib.symbols.execute_javascript(scriptPtr) === 1;
        }
        
        /**
         * ウィンドウの透明度を設定
         * @param alpha 透明度 (0-255)
         */
        setTransparency(alpha: number): boolean {
            return lib.symbols.set_window_transparency(Math.max(0, Math.min(255, alpha))) === 1;
        }
        
        /**
         * クリック透過を設定
         * @param enabled クリック透過を有効にするか
         */
        setClickThrough(enabled: boolean): boolean {
            return lib.symbols.set_click_through(enabled ? 1 : 0) === 1;
        }
        
        /**
         * ウィンドウを閉じる
         */
        closeWindow(): boolean {
            return lib.symbols.close_window() === 1;
        }
        
        /**
         * メッセージループを実行（ブロッキング）
         */
        runMessageLoop(): number {
            return lib.symbols.run_message_loop();
        }
        
        /**
         * HTMLファイルを読み込む
         * @param filePath HTMLファイルのパス
         */
        loadHtmlFile(filePath: string): boolean {
            const filePathPtr = Buffer.from(filePath + '\0', 'utf8');
            return lib.symbols.load_html_file(filePathPtr) === 1;
        }
        
        /**
         * ウィンドウハンドルを取得
         */
        getWindowHandle(): number {
            return this.windowHandle;
        }
    }

    // WebViewイベントハンドラーのインターフェース
    export interface WebViewEventHandlers {
        onWindowCreated?: () => void;
        onNavigationCompleted?: (url: string) => void;
        onDocumentTitleChanged?: (title: string) => void;
        onWindowClosed?: () => void;
    }

    // 高レベルなWebViewマネージャー
    export class WebViewManager {
        private webview: WebView;
        private eventHandlers: WebViewEventHandlers = {};
        
        constructor() {
            this.webview = new WebView();
        }
        
        /**
         * イベントハンドラーを設定
         */
        setEventHandlers(handlers: WebViewEventHandlers) {
            this.eventHandlers = { ...this.eventHandlers, ...handlers };
        }
        
        /**
         * アプリケーションを起動
         */
        async startApp(config: {
            title?: string;
            width?: number;
            height?: number;
            transparent?: boolean;
            html?: string;
            url?: string;
            filePath?: string;
        }) {
            // ウィンドウを作成
            const success = this.webview.createWindow(
                config.title,
                config.width,
                config.height,
                config.transparent
            );
            
            if (!success) {
                throw new Error("WebViewウィンドウの作成に失敗しました");
            }
            
            // イベントハンドラーを呼び出し
            this.eventHandlers.onWindowCreated?.();
            
            // コンテンツを設定
            if (config.html) {
                this.webview.setHtmlContent(config.html);
            } else if (config.url) {
                this.webview.navigateToUrl(config.url);
            } else if (config.filePath) {
                this.webview.loadHtmlFile(config.filePath);
            }
            
            // メッセージループを開始（ブロッキング）
            return this.webview.runMessageLoop();
        }
        
        /**
         * WebViewインスタンスを取得
         */
        getWebView(): WebView {
            return this.webview;
        }
    }

    // デフォルトエクスポート
    export default WebViewManager;

