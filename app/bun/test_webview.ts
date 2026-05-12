/// bun → zig DLL → webui-2.dll で WebView ウィンドウを表示
import { dlopen, FFIType, suffix } from "bun:ffi";
import { join } from "path";

// DLLのあるディレクトリを直接指定
const DllDir = "a:/Project/Nebulabun/app/zig/zig-out/bin";
const libPath = join(DllDir, `nebulabun_webview.${suffix}`);

console.log(`Loading: ${libPath}`);

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

// HTML content
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; text-align: center; padding: 40px; }
  </style>
</head>
<body>
  <h1>Nebulabun WebUI</h1>
  <p>Zig → webui-2.dll → WebView 表示成功!</p>
  <button onclick="runZig()">Zig から呼び出し</button>
  <script src="/webui.js"></script>
  <script>
    function runZig() {
      alert("Hello from Bun/Zig/WebUI!");
    }
  </script>
</body>
</html>
`;

// Helper: convert string to null-terminated buffer for cstring FFI
function toCStr(s: string): Buffer {
  return Buffer.from(s + "\0", "utf8");
}

// Create window with WebView
console.log("Creating window...");
const ok = lib.symbols.create_window(toCStr("Nebulabun"), 800, 600, true);
console.log(`create_window: ${ok}`);

if (ok) {
  // Show HTML content (must pass as Buffer for cstring)
  lib.symbols.show_html(toCStr(html));

  // Run message loop (blocking)
  console.log("Running message loop...");
  lib.symbols.run_message_loop();
  console.log("Window closed.");
}
