/// Zig wrapper for webui-2 C library  
/// Dynamically loads webui-2.dll at runtime
const std = @import("std");

// --- Win32 API externs ---
const HMODULE = *opaque {};
const HINSTANCE = *opaque {};

extern "kernel32" fn GetModuleHandleA(lpModuleName: ?[*:0]const u8) callconv(.c) ?HMODULE;
extern "kernel32" fn GetModuleFileNameA(hModule: ?HMODULE, lpFilename: [*]u8, nSize: u32) callconv(.c) u32;
extern "kernel32" fn LoadLibraryA(lpLibFileName: [*:0]const u8) callconv(.c) ?HMODULE;
extern "kernel32" fn GetProcAddress(hModule: HMODULE, lpProcName: [*:0]const u8) callconv(.c) ?*const anyopaque;

// --- webui C struct definitions ---
const Event = extern struct {
    window: usize,
    event_type: usize,
    element: [*c]u8,
    event_number: usize,
    bind_id: usize,
    client_id: usize,
    connection_id: usize,
    cookies: [*c]u8,
};

// --- DLL function pointer types ---
const NewWindow = *const fn () callconv(.c) usize;
const Show = *const fn (window: usize, content: [*:0]const u8) callconv(.c) bool;
const ShowWv = *const fn (window: usize, content: [*:0]const u8) callconv(.c) bool;
const SetSize = *const fn (window: usize, width: u32, height: u32) callconv(.c) void;
const Wait = *const fn () callconv(.c) void;
const Close = *const fn (window: usize) callconv(.c) void;
const Destroy = *const fn (window: usize) callconv(.c) void;
const Clean = *const fn () callconv(.c) void;
const Run = *const fn (window: usize, script: [*:0]const u8) callconv(.c) void;

var webui_dll: ?HMODULE = null;
var webui_new_window_fn: ?NewWindow = null;
var webui_show_fn: ?Show = null;
var webui_show_wv_fn: ?ShowWv = null;
var webui_set_size_fn: ?SetSize = null;
var webui_wait_fn: ?Wait = null;
var webui_close_fn: ?Close = null;
var webui_destroy_fn: ?Destroy = null;
var webui_clean_fn: ?Clean = null;
var webui_run_fn: ?Run = null;

fn loadWebui() bool {
    if (webui_dll != null) return true;

    // Try loading webui-2.dll (must be in same dir as this DLL)
    webui_dll = LoadLibraryA("webui-2.dll");
    if (webui_dll == null) return false;

    const hMod = webui_dll.?;

    webui_new_window_fn = @ptrCast(@alignCast(GetProcAddress(hMod, "webui_new_window") orelse return false));
    webui_show_fn = @ptrCast(@alignCast(GetProcAddress(hMod, "webui_show") orelse return false));
    webui_show_wv_fn = @ptrCast(@alignCast(GetProcAddress(hMod, "webui_show_wv") orelse return false));
    webui_set_size_fn = @ptrCast(@alignCast(GetProcAddress(hMod, "webui_set_size") orelse return false));
    webui_wait_fn = @ptrCast(@alignCast(GetProcAddress(hMod, "webui_wait") orelse return false));
    webui_close_fn = @ptrCast(@alignCast(GetProcAddress(hMod, "webui_close") orelse return false));
    webui_destroy_fn = @ptrCast(@alignCast(GetProcAddress(hMod, "webui_destroy") orelse return false));
    webui_clean_fn = @ptrCast(@alignCast(GetProcAddress(hMod, "webui_clean") orelse return false));
    webui_run_fn = @ptrCast(@alignCast(GetProcAddress(hMod, "webui_run") orelse return false));

    return true;
}

var g_window: usize = 0;

export fn init_webui() bool {
    return loadWebui();
}

export fn create_window(title: [*:0]const u8, width: u32, height: u32, use_webview: bool) bool {
    if (!loadWebui()) return false;
    g_window = webui_new_window_fn.?();
    if (g_window == 0) return false;
    webui_set_size_fn.?(g_window, width, height);
    if (use_webview) {
        return webui_show_wv_fn.?(g_window, title);
    } else {
        return webui_show_fn.?(g_window, title);
    }
}

export fn show_html(html: [*:0]const u8) bool {
    if (g_window == 0) return false;
    return webui_show_fn.?(g_window, html);
}

export fn run_javascript(script: [*:0]const u8) void {
    if (g_window == 0) return;
    webui_run_fn.?(g_window, script);
}

export fn close_window() void {
    if (g_window == 0) return;
    webui_close_fn.?(g_window);
    webui_destroy_fn.?(g_window);
    g_window = 0;
}

export fn run_message_loop() void {
    webui_wait_fn.?();
    webui_clean_fn.?();
}