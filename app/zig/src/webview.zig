/// Zig wrapper for webui-2 C library  
/// Dynamically loads webui-2.dll at runtime
const std = @import("std");

// --- Win32 API externs ---
const HMODULE = *opaque {};

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
const ShowBrowser = *const fn (window: usize, content: [*:0]const u8, browser: usize) callconv(.c) bool;
const SetSize = *const fn (window: usize, width: u32, height: u32) callconv(.c) void;
const SetMinSize = *const fn (window: usize, width: u32, height: u32) callconv(.c) void;
const SetPosition = *const fn (window: usize, x: u32, y: u32) callconv(.c) void;
const SetCenter = *const fn (window: usize) callconv(.c) void;
const SetTransparent = *const fn (window: usize, status: bool) callconv(.c) void;
const SetFrameless = *const fn (window: usize, status: bool) callconv(.c) void;
const SetKiosk = *const fn (window: usize, status: bool) callconv(.c) void;
const SetHide = *const fn (window: usize, status: bool) callconv(.c) void;
const SetResizable = *const fn (window: usize, status: bool) callconv(.c) void;
const SetIcon = *const fn (window: usize, icon: [*:0]const u8, icon_type: [*:0]const u8) callconv(.c) void;
const Focus = *const fn (window: usize) callconv(.c) void;
const Navigate = *const fn (window: usize, url: [*:0]const u8) callconv(.c) void;
const GetUrl = *const fn (window: usize) callconv(.c) [*:0]const u8;
const IsShown = *const fn (window: usize) callconv(.c) bool;
const Wait = *const fn () callconv(.c) void;
const Close = *const fn (window: usize) callconv(.c) void;
const Destroy = *const fn (window: usize) callconv(.c) void;
const Exit = *const fn () callconv(.c) void;
const Clean = *const fn () callconv(.c) void;
const Run = *const fn (window: usize, script: [*:0]const u8) callconv(.c) void;
const Bind = *const fn (window: usize, element: [*:0]const u8, func: *const fn (e: *Event) callconv(.c) void) callconv(.c) usize;
const SetRootFolder = *const fn (window: usize, path: [*:0]const u8) callconv(.c) bool;
const SetConfig = *const fn (option: usize, status: bool) callconv(.c) void;

// --- DLL handles & fn pointers ---
var webui_dll: ?HMODULE = null;

var webui_new_window_fn: ?NewWindow = null;
var webui_show_fn: ?Show = null;
var webui_show_wv_fn: ?ShowWv = null;
var webui_show_browser_fn: ?ShowBrowser = null;
var webui_set_size_fn: ?SetSize = null;
var webui_set_min_size_fn: ?SetMinSize = null;
var webui_set_position_fn: ?SetPosition = null;
var webui_set_center_fn: ?SetCenter = null;
var webui_set_transparent_fn: ?SetTransparent = null;
var webui_set_frameless_fn: ?SetFrameless = null;
var webui_set_kiosk_fn: ?SetKiosk = null;
var webui_set_hide_fn: ?SetHide = null;
var webui_set_resizable_fn: ?SetResizable = null;
var webui_set_icon_fn: ?SetIcon = null;
var webui_focus_fn: ?Focus = null;
var webui_navigate_fn: ?Navigate = null;
var webui_get_url_fn: ?GetUrl = null;
var webui_is_shown_fn: ?IsShown = null;
var webui_wait_fn: ?Wait = null;
var webui_close_fn: ?Close = null;
var webui_destroy_fn: ?Destroy = null;
var webui_exit_fn: ?Exit = null;
var webui_clean_fn: ?Clean = null;
var webui_run_fn: ?Run = null;
var webui_bind_fn: ?Bind = null;
var webui_set_root_folder_fn: ?SetRootFolder = null;
var webui_set_config_fn: ?SetConfig = null;

fn loadWebui() bool {
    if (webui_dll != null) return true;
    webui_dll = LoadLibraryA("webui-2.dll") orelse return false;
    const hMod = webui_dll.?;

    const load = struct {
        fn get(mod: HMODULE, name: [*:0]const u8) ?*const anyopaque {
            return GetProcAddress(mod, name);
        }
    }.get;

    webui_new_window_fn       = @ptrCast(@alignCast(load(hMod, "webui_new_window")       orelse return false));
    webui_show_fn             = @ptrCast(@alignCast(load(hMod, "webui_show")             orelse return false));
    webui_show_wv_fn          = @ptrCast(@alignCast(load(hMod, "webui_show_wv")          orelse return false));
    webui_show_browser_fn     = @ptrCast(@alignCast(load(hMod, "webui_show_browser")     orelse return false));
    webui_set_size_fn         = @ptrCast(@alignCast(load(hMod, "webui_set_size")         orelse return false));
    webui_set_min_size_fn     = @ptrCast(@alignCast(load(hMod, "webui_set_minimum_size") orelse return false));
    webui_set_position_fn     = @ptrCast(@alignCast(load(hMod, "webui_set_position")     orelse return false));
    webui_set_center_fn       = @ptrCast(@alignCast(load(hMod, "webui_set_center")       orelse return false));
    webui_set_transparent_fn  = @ptrCast(@alignCast(load(hMod, "webui_set_transparent")  orelse return false));
    webui_set_frameless_fn    = @ptrCast(@alignCast(load(hMod, "webui_set_frameless")    orelse return false));
    webui_set_kiosk_fn        = @ptrCast(@alignCast(load(hMod, "webui_set_kiosk")        orelse return false));
    webui_set_hide_fn         = @ptrCast(@alignCast(load(hMod, "webui_set_hide")         orelse return false));
    webui_set_resizable_fn    = @ptrCast(@alignCast(load(hMod, "webui_set_resizable")    orelse return false));
    webui_set_icon_fn         = @ptrCast(@alignCast(load(hMod, "webui_set_icon")         orelse return false));
    webui_focus_fn            = @ptrCast(@alignCast(load(hMod, "webui_focus")            orelse return false));
    webui_navigate_fn         = @ptrCast(@alignCast(load(hMod, "webui_navigate")         orelse return false));
    webui_get_url_fn          = @ptrCast(@alignCast(load(hMod, "webui_get_url")          orelse return false));
    webui_is_shown_fn         = @ptrCast(@alignCast(load(hMod, "webui_is_shown")         orelse return false));
    webui_wait_fn             = @ptrCast(@alignCast(load(hMod, "webui_wait")             orelse return false));
    webui_close_fn            = @ptrCast(@alignCast(load(hMod, "webui_close")            orelse return false));
    webui_destroy_fn          = @ptrCast(@alignCast(load(hMod, "webui_destroy")          orelse return false));
    webui_exit_fn             = @ptrCast(@alignCast(load(hMod, "webui_exit")             orelse return false));
    webui_clean_fn            = @ptrCast(@alignCast(load(hMod, "webui_clean")            orelse return false));
    webui_run_fn              = @ptrCast(@alignCast(load(hMod, "webui_run")              orelse return false));
    webui_bind_fn             = @ptrCast(@alignCast(load(hMod, "webui_bind")             orelse return false));
    webui_set_root_folder_fn  = @ptrCast(@alignCast(load(hMod, "webui_set_root_folder")  orelse return false));
    webui_set_config_fn       = @ptrCast(@alignCast(load(hMod, "webui_set_config")       orelse return false));

    return true;
}

var g_window: usize = 0;

// --- DLL Export Functions (called from bun via FFI) ---

export fn create_window(title: [*:0]const u8, width: u32, height: u32, use_webview: bool) bool {
    if (!loadWebui()) return false;
    g_window = webui_new_window_fn.?();
    if (g_window == 0) return false;
    webui_set_size_fn.?(g_window, width, height);
    if (use_webview) return webui_show_wv_fn.?(g_window, title);
    return webui_show_fn.?(g_window, title);
}

export fn show_html(html: [*:0]const u8) bool {
    if (g_window == 0) return false;
    return webui_show_wv_fn.?(g_window, html);
}

export fn show_browser(content: [*:0]const u8, browser_type: u32) bool {
    if (g_window == 0) return false;
    return webui_show_browser_fn.?(g_window, content, browser_type);
}

export fn run_javascript(script: [*:0]const u8) void {
    if (g_window == 0) return;
    webui_run_fn.?(g_window, script);
}

export fn set_window_size(width: u32, height: u32) void {
    if (g_window == 0) return;
    webui_set_size_fn.?(g_window, width, height);
}

export fn set_min_size(width: u32, height: u32) void {
    if (g_window == 0) return;
    webui_set_min_size_fn.?(g_window, width, height);
}

export fn set_window_position(x: u32, y: u32) void {
    if (g_window == 0) return;
    webui_set_position_fn.?(g_window, x, y);
}

export fn center_window() void {
    if (g_window == 0) return;
    webui_set_center_fn.?(g_window);
}

export fn set_transparent(enabled: bool) void {
    if (g_window == 0) return;
    webui_set_transparent_fn.?(g_window, enabled);
}

export fn set_frameless(enabled: bool) void {
    if (g_window == 0) return;
    webui_set_frameless_fn.?(g_window, enabled);
}

export fn set_resizable(enabled: bool) void {
    if (g_window == 0) return;
    webui_set_resizable_fn.?(g_window, enabled);
}

export fn focus_window() void {
    if (g_window == 0) return;
    webui_focus_fn.?(g_window);
}

export fn navigate(url: [*:0]const u8) void {
    if (g_window == 0) return;
    webui_navigate_fn.?(g_window, url);
}

export fn get_url() [*:0]const u8 {
    if (g_window == 0) return "";
    return webui_get_url_fn.?(g_window);
}

export fn is_window_shown() bool {
    if (g_window == 0) return false;
    return webui_is_shown_fn.?(g_window);
}

export fn close_window() void {
    if (g_window == 0) return;
    webui_close_fn.?(g_window);
    webui_destroy_fn.?(g_window);
    g_window = 0;
}

export fn exit_app() void {
    webui_exit_fn.?();
}

export fn run_message_loop() void {
    webui_wait_fn.?();
    webui_clean_fn.?();
}