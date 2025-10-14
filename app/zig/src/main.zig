const std = @import("std");
const webui = @import("webui");

// グローバルなWebViewインスタンス
var g_window: ?webui = null;
var g_allocator: std.mem.Allocator = undefined;

// C FFI関数のエクスポート
export fn create_webview_window(title: [*c]const u8, width: c_int, height: c_int, transparent: c_int) c_int {
    g_allocator = std.heap.page_allocator;
    
    // タイトル文字列を取得
    _ = if (title != null) 
        std.mem.sliceTo(title, 0) 
    else 
        "Nebulabun App";
    
    // WebViewウィンドウを作成
    g_window = webui.newWindow();
    
    // ウィンドウサイズを設定
    g_window.?.setSize(@intCast(width), @intCast(height));
    
    // 透過設定
    if (transparent != 0) {
        g_window.?.setTransparent(true);
    }
    
    // ウィンドウを表示（空のHTMLで初期化）
    g_window.?.show("<html><head><script src='/webui.js'></script></head><body></body></html>") catch {
        return 0;
    };
    
    return 1; // 成功
}

export fn set_html_content(html: [*c]const u8) c_int {
    if (g_window == null or html == null) {
        return 0;
    }
    
    const html_str = std.mem.sliceTo(html, 0);
    
    // HTMLコンテンツを設定（show関数を使用）
    g_window.?.show(html_str) catch {
        return 0;
    };
    
    return 1;
}

export fn navigate_to_url(url: [*c]const u8) c_int {
    if (g_window == null or url == null) {
        return 0;
    }
    
    const url_str = std.mem.sliceTo(url, 0);
    
    // URLに移動
    g_window.?.navigate(url_str);
    
    return 1;
}

export fn execute_javascript(script: [*c]const u8) c_int {
    if (g_window == null or script == null) {
        return 0;
    }
    
    const script_str = std.mem.sliceTo(script, 0);
    
    // JavaScriptを実行
    g_window.?.run(script_str);
    
    return 1;
}

export fn set_window_transparency(alpha: c_int) c_int {
    if (g_window == null) {
        return 0;
    }
    
    // 透明度を設定（0-255を0.0-1.0に変換）
    const alpha_float = @as(f32, @floatFromInt(alpha)) / 255.0;
    g_window.?.setTransparent(alpha_float < 1.0);
    
    return 1;
}

export fn set_click_through(enabled: c_int) c_int {
    if (g_window == null) {
        return 0;
    }
    
    // クリック透過を設定
    g_window.?.setTransparent(enabled != 0);
    
    return 1;
}

export fn load_html_file(file_path: [*c]const u8) c_int {
    if (g_window == null or file_path == null) {
        return 0;
    }
    
    const file_path_str = std.mem.sliceTo(file_path, 0);
    
    // ファイルを読み込む
    const file = std.fs.cwd().openFile(file_path_str, .{}) catch {
        return 0;
    };
    defer file.close();
    
    // ファイルサイズを取得
    const file_size = file.getEndPos() catch {
        return 0;
    };
    
    // メモリを割り当て（null終端のため+1）
    const html_content = g_allocator.alloc(u8, file_size + 1) catch {
        return 0;
    };
    defer g_allocator.free(html_content);
    
    // ファイルを読み込む
    _ = file.readAll(html_content[0..file_size]) catch {
        return 0;
    };
    
    // null終端を追加
    html_content[file_size] = 0;
    
    // HTMLコンテンツを設定（show関数を使用）
    g_window.?.show(html_content[0..file_size:0]) catch {
        return 0;
    };
    
    return 1;
}

export fn close_window() c_int {
    if (g_window == null) {
        return 0;
    }
    
    // ウィンドウを閉じる
    g_window.?.close();
    g_window = null;
    
    return 1;
}

export fn run_message_loop() c_int {
    // WebUIのメッセージループを実行
    webui.wait();
    return 0;
}

// メイン関数（テスト用）
pub fn main() !void {
    g_allocator = std.heap.page_allocator;
    
    // テスト用のウィンドウ作成
    var nwin = webui.newWindow();
    try nwin.show("<html><head><script src='/webui.js'></script></head><body><h1>Nebulabun WebUI Test</h1><p>Zig implementation is working!</p></body></html>");
    webui.wait();
}
