/// bun 用 高レベル WebView API
/// ユーザーはこのモジュールから createWindow() をインポートして使う
import { dlopen, FFIType, suffix } from "bun:ffi";
import { join } from "path";

// --- DLL ロード ---
const DllDir = import.meta.dir
  ? join(import.meta.dir, "..", "zig", "zig-out", "bin")
  : join(process.cwd(), "app", "zig", "zig-out", "bin");

const libPath = join(DllDir, `nebulabun_webview.${suffix}`);

const lib = dlopen(libPath, {
  create_window: {
    args: [FFIType.cstring, FFIType.u32, FFIType.u32, FFIType.bool],
    returns: FFIType.bool,
  },
  show_html: {
    args: [FFIType.cstring],
    returns: FFIType.bool,
  },
  run_javascript: {
    args: [FFIType.cstring],
    returns: FFIType.void,
  },
  close_window: {
    args: [],
    returns: FFIType.void,
  },
  run_message_loop: {
    args: [],
    returns: FFIType.void,
  },
});

// --- ヘルパー ---
function toCStr(s: string): Buffer {
  return Buffer.from(s + "\0", "utf8");
}

// --- 公開インターフェース ---

export interface WindowConfig {
  title: string;
  width: number;
  height: number;
  transparent?: boolean;
}

export class NebulabunWindow {
  private config: WindowConfig;

  constructor(config: WindowConfig) {
    this.config = {
      transparent: false,
      ...config,
    };
  }

  startWithHtml(html: string): void {
    const { title, width, height } = this.config;

    // ウィンドウ作成
    const ok = lib.symbols.create_window(
      toCStr(title),
      width,
      height,
      true // WebView モード
    );

    if (!ok) {
      console.error("Failed to create window. Check that webui-2.dll is in the same directory.");
      return;
    }

    // HTML を表示
    lib.symbols.show_html(toCStr(html));

    // メッセージループ (ブロッキング)
    lib.symbols.run_message_loop();
  }
}

/**
 * WebView ウィンドウを作成する
 * @example
 * ```typescript
 * import { createWindow } from "./app/bun/window";
 *
 * const win = createWindow({
 *   title: "My App",
 *   width: 800,
 *   height: 600,
 * });
 *
 * win.startWithHtml(`<h1>Hello</h1>`);
 * ```
 */
export function createWindow(config: WindowConfig): NebulabunWindow {
  return new NebulabunWindow(config);
}