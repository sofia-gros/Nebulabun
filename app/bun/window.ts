import { WebView, WebViewManager } from './ipc';

/**
 * CLI引数から構築されるウィンドウ設定
 * cli/index.ts で使用されるインターフェース
 */
export interface WindowConfig {
    title: string;
    width: number;
    height: number;
    transparent: boolean;
    clickThrough: boolean;
    transparency: number; // 0-255
}

/**
 * CLIから使用される、高レベルなウィンドウ操作を提供するクラス
 */
class WindowWrapper {
    private webview: WebView;

    constructor(private config: WindowConfig) {
        // WebViewManagerを初期化し、WebViewクラスのインスタンスを取得
        const manager = new WebViewManager();
        this.webview = manager.getWebView();
    }

    /**
     * ウィンドウを作成し、メッセージループを開始する
     * @param loadFn コンテンツをロードする関数 (setHtmlContent, navigateToUrlなど)
     */
    private async startLoop(loadFn: (webview: WebView) => boolean): Promise<number> {
        // 1. ウィンドウを作成 (透過設定はここで初期設定される)
        // clickThrough や transparency < 255 の場合は強制的に透過モードを有効にする
        const isTransparentInitial = this.config.transparent || this.config.clickThrough || this.config.transparency < 255;
        
        const success = this.webview.createWindow(
            this.config.title,
            this.config.width,
            this.config.height,
            isTransparentInitial
        );

        if (!success) {
            console.error("ウィンドウの作成に失敗しました。FFIログを確認してください。");
            return 1;
        }

        // 2. その他のウィンドウ設定を適用
        // 透明度を設定
        if (this.config.transparent || this.config.transparency < 255) {
            this.webview.setTransparency(this.config.transparency);
        }
        // クリック透過を設定
        if (this.config.clickThrough) {
            this.webview.setClickThrough(true);
        }

        // 3. コンテンツをロード
        if (!loadFn(this.webview)) {
            console.error("コンテンツのロードに失敗しました。");
            this.webview.closeWindow();
            return 1;
        }

        // 4. メッセージループを開始（ブロッキング）
        return this.webview.runMessageLoop();
    }

    startWithHtml(html: string): Promise<number> {
        return this.startLoop((w) => w.setHtmlContent(html));
    }

    startWithFile(filePath: string): Promise<number> {
        return this.startLoop((w) => w.loadHtmlFile(filePath));
    }

    startWithUrl(url: string): Promise<number> {
        return this.startLoop((w) => w.navigateToUrl(url));
    }

    close() {
        this.webview.closeWindow();
    }
}

/**
 * WindowWrapperのインスタンスを作成するファクトリ関数
 */
export function createWindow(config: WindowConfig): WindowWrapper {
    return new WindowWrapper(config);
}
