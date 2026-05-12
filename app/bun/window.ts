/// Nebulabun WebView API for bun
/// bun → Zig DLL → webui-2.dll → WebView2
import { dlopen, FFIType, suffix } from "bun:ffi";
import { join } from "path";

// --- DLL ロード ---
const DllDir = import.meta.dir
  ? join(import.meta.dir, "..", "zig", "zig-out", "bin")
  : join(process.cwd(), "app", "zig", "zig-out", "bin");

const libPath = join(DllDir, `nebulabun_webview.${suffix}`);

const lib = dlopen(libPath, {
  create_window:    { args: [FFIType.cstring, FFIType.u32, FFIType.u32, FFIType.bool], returns: FFIType.bool },
  show_html:        { args: [FFIType.cstring],                                          returns: FFIType.bool },
  show_browser:     { args: [FFIType.cstring, FFIType.u32],                              returns: FFIType.bool },
  run_javascript:   { args: [FFIType.cstring],                                          returns: FFIType.void },
  set_window_size:  { args: [FFIType.u32, FFIType.u32],                                  returns: FFIType.void },
  set_min_size:     { args: [FFIType.u32, FFIType.u32],                                  returns: FFIType.void },
  set_window_position: { args: [FFIType.u32, FFIType.u32],                               returns: FFIType.void },
  center_window:    { args: [],                                                          returns: FFIType.void },
  set_transparent:  { args: [FFIType.bool],                                              returns: FFIType.void },
  set_frameless:    { args: [FFIType.bool],                                              returns: FFIType.void },
  set_resizable:    { args: [FFIType.bool],                                              returns: FFIType.void },
  focus_window:     { args: [],                                                          returns: FFIType.void },
  navigate:         { args: [FFIType.cstring],                                          returns: FFIType.void },
  get_url:          { args: [],                                                          returns: FFIType.cstring },
  is_window_shown:  { args: [],                                                          returns: FFIType.bool },
  close_window:     { args: [],                                                          returns: FFIType.void },
  exit_app:         { args: [],                                                          returns: FFIType.void },
  run_message_loop: { args: [],                                                          returns: FFIType.void },
});

// --- ヘルパー ---
function toCStr(s: string): Buffer {
  return Buffer.from(s + "\0", "utf8");
}

// --- 型定義 ---

export interface WindowConfig {
  title: string;
  width: number;
  height: number;
  transparent?: boolean;
  frameless?: boolean;
  resizable?: boolean;
  center?: boolean;
}

export class NebulabunWindow {
  private config: WindowConfig;

  constructor(config: WindowConfig) {
    this.config = {
      transparent: false,
      frameless: false,
      resizable: true,
      center: true,
      ...config,
    };
  }

  /**
   * HTML コンテンツを表示してメッセージループを開始（ブロッキング）
   */
  startWithHtml(html: string): void {
    const { title, width, height, transparent, frameless, resizable, center } = this.config;

    const ok = lib.symbols.create_window(toCStr(title), width, height, true);
    if (!ok) {
      console.error("Failed to create window.");
      return;
    }

    // 設定
    if (transparent) lib.symbols.set_transparent(true);
    if (frameless)   lib.symbols.set_frameless(true);
    if (!resizable)  lib.symbols.set_resizable(false);
    if (center)      lib.symbols.center_window();
    // HTML 表示
    lib.symbols.show_html(toCStr(html));
    // メッセージループ
    lib.symbols.run_message_loop();
  }

  // --- ウィンドウ操作メソッド ---

  /** ウィンドウサイズ変更 */
  setSize(width: number, height: number): void {
    lib.symbols.set_window_size(width, height);
  }

  /** 最小サイズ設定 */
  setMinSize(width: number, height: number): void {
    lib.symbols.set_min_size(width, height);
  }

  /** ウィンドウ位置設定 */
  setPosition(x: number, y: number): void {
    lib.symbols.set_window_position(x, y);
  }

  /** 画面中央 */
  center(): void {
    lib.symbols.center_window();
  }

  /** 透過設定 */
  setTransparent(enabled: boolean): void {
    lib.symbols.set_transparent(enabled);
  }

  /** フレームレス設定 */
  setFrameless(enabled: boolean): void {
    lib.symbols.set_frameless(enabled);
  }

  /** リサイズ可否 */
  setResizable(enabled: boolean): void {
    lib.symbols.set_resizable(enabled);
  }

  /** フォーカス */
  focus(): void {
    lib.symbols.focus_window();
  }

  /** URL 遷移 */
  navigate(url: string): void {
    lib.symbols.navigate(toCStr(url));
  }

  /** 現在のURL取得 */
  getUrl(): string {
    return lib.symbols.get_url();
  }

  /** ウィンドウ表示中か */
  isShown(): boolean {
    return lib.symbols.is_window_shown();
  }

  /** JavaScript 実行 */
  executeJS(script: string): void {
    lib.symbols.run_javascript(toCStr(script));
  }

  /** ウィンドウを閉じる */
  close(): void {
    lib.symbols.close_window();
  }

  /** アプリ終了 */
  exit(): void {
    lib.symbols.exit_app();
  }
}

// --- ファクトリ関数 ---

/**
 * WebView ウィンドウを作成する
 *
 * ```typescript
 * import { createWindow } from "./app/bun/window";
 *
 * const win = createWindow({ title: "My App", width: 800, height: 600 });
 * win.startWithHtml(`<h1>Hello</h1>`);
 * ```
 */
export function createWindow(config: WindowConfig): NebulabunWindow {
  return new NebulabunWindow(config);
}