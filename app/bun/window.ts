import { WebView, WebViewManager } from "./ipc";

// ウィンドウ設定のインターフェース
export interface WindowConfig {
  title?: string;
  width?: number;
  height?: number;
  transparent?: boolean;
  clickThrough?: boolean;
  transparency?: number; // 0-255
  resizable?: boolean;
  alwaysOnTop?: boolean;
}

// ドラッグ可能な要素の設定
export interface DraggableConfig {
  selector: string; // CSSセレクター
  enabled: boolean;
}

// クリック可能な要素の設定
export interface ClickableConfig {
  selector: string; // CSSセレクター
  enabled: boolean;
}

// Nebulabunウィンドウクラス
export class NebulabunWindow {
  private webviewManager: WebViewManager;
  private config: WindowConfig;
  private draggableElements: DraggableConfig[] = [];
  private clickableElements: ClickableConfig[] = [];
  
  constructor(config: WindowConfig = {}) {
    this.config = {
      title: "Nebulabun App",
      width: 800,
      height: 600,
      transparent: false,
      clickThrough: false,
      transparency: 255,
      resizable: true,
      alwaysOnTop: false,
      ...config
    };
    
    this.webviewManager = new WebViewManager();
    this.setupEventHandlers();
  }
  
  /**
   * イベントハンドラーを設定
   */
  private setupEventHandlers() {
    this.webviewManager.setEventHandlers({
      onWindowCreated: () => {
        console.log("ウィンドウが作成されました");
        this.applyWindowSettings();
      },
      onNavigationCompleted: (url) => {
        console.log(`ナビゲーション完了: ${url}`);
        this.injectNebulabunScript();
      },
      onWindowClosed: () => {
        console.log("ウィンドウが閉じられました");
      }
    });
  }
  
  /**
   * ウィンドウ設定を適用
   */
  private applyWindowSettings() {
    const webview = this.webviewManager.getWebView();
    
    if (this.config.transparency !== undefined && this.config.transparency < 255) {
      webview.setTransparency(this.config.transparency);
    }
    
    if (this.config.clickThrough) {
      webview.setClickThrough(true);
    }
  }
  
  /**
   * Nebulabun固有のJavaScriptを注入
   */
  private injectNebulabunScript() {
    const script = `
      (function() {
        // ドラッグ機能の実装
        function enableDragging(selector) {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            element.style.cursor = 'move';
            element.addEventListener('mousedown', (e) => {
              // ウィンドウドラッグの開始をRustに通知
              window.external.invoke('start_drag');
            });
          });
        }
        
        // クリック機能の実装
        function enableClicking(selector) {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            element.addEventListener('click', (e) => {
              // クリックイベントをRustに通知
              window.external.invoke('element_clicked', {
                selector: selector,
                elementId: element.id,
                className: element.className
              });
            });
          });
        }
        
        // .draggable クラスの要素を自動的にドラッグ可能にする
        enableDragging('.draggable');
        
        // .clickable クラスの要素を自動的にクリック可能にする
        enableClicking('.clickable');
        
        // Nebulabun API をグローバルに公開
        window.Nebulabun = {
          setTransparency: (alpha) => {
            window.external.invoke('set_transparency', alpha);
          },
          setClickThrough: (enabled) => {
            window.external.invoke('set_click_through', enabled);
          },
          closeWindow: () => {
            window.external.invoke('close_window');
          },
          executeScript: (script) => {
            eval(script);
          }
        };
        
        console.log('Nebulabun initialized');
      })();
    `;
    
    this.webviewManager.getWebView().executeJavaScript(script);
  }
  
  /**
   * HTMLコンテンツでアプリを起動
   */
  async startWithHtml(html: string) {
    return this.webviewManager.startApp({
      ...this.config,
      html
    });
  }
  
  /**
   * URLでアプリを起動
   */
  async startWithUrl(url: string) {
    return this.webviewManager.startApp({
      ...this.config,
      url
    });
  }
  
  /**
   * ローカルHTMLファイルでアプリを起動
   */
  async startWithFile(filePath: string) {
    return this.webviewManager.startApp({
      ...this.config,
      filePath
    });
  }
  
  /**
   * ドラッグ可能な要素を追加
   */
  addDraggableElement(selector: string) {
    this.draggableElements.push({ selector, enabled: true });
    
    // 既にウィンドウが作成されている場合は即座に適用
    const script = `
      document.querySelectorAll('${selector}').forEach(element => {
        element.style.cursor = 'move';
        element.classList.add('draggable');
      });
    `;
    this.webviewManager.getWebView().executeJavaScript(script);
  }
  
  /**
   * クリック可能な要素を追加
   */
  addClickableElement(selector: string) {
    this.clickableElements.push({ selector, enabled: true });
    
    // 既にウィンドウが作成されている場合は即座に適用
    const script = `
      document.querySelectorAll('${selector}').forEach(element => {
        element.classList.add('clickable');
      });
    `;
    this.webviewManager.getWebView().executeJavaScript(script);
  }
  
  /**
   * JavaScriptを実行
   */
  executeScript(script: string) {
    return this.webviewManager.getWebView().executeJavaScript(script);
  }
  
  /**
   * ウィンドウを閉じる
   */
  close() {
    return this.webviewManager.getWebView().closeWindow();
  }
  
  /**
   * WebViewインスタンスを取得
   */
  getWebView() {
    return this.webviewManager.getWebView();
  }
}

// 便利な関数をエクスポート
export function createWindow(config?: WindowConfig): NebulabunWindow {
  return new NebulabunWindow(config);
}

export default NebulabunWindow;
