use std::ffi::CStr;
use std::os::raw::{c_char, c_int};
use webview2_com::Microsoft::Web::WebView2::Win32::{ICoreWebView2, ICoreWebView2Controller};
use windows::{
  core::*,
  Win32::{
    Foundation::{COLORREF, *},
    Graphics::Gdi::{CreateSolidBrush, InvalidateRect, UpdateWindow, HBRUSH},
    System::LibraryLoader::GetModuleHandleW,
    UI::WindowsAndMessaging::*,
  },
};

// WebView2インスタンスを管理する構造体
pub struct WebViewInstance {
  pub hwnd: HWND,
  pub controller: Option<ICoreWebView2Controller>,
  pub webview: Option<ICoreWebView2>,
}

static mut WEBVIEW_INSTANCE: Option<WebViewInstance> = None;

// WebView2ウィンドウを作成
#[no_mangle]
pub extern "C" fn create_webview_window(
  title: *const c_char,
  width: c_int,
  height: c_int,
  transparent: c_int,
) -> c_int {
  unsafe {
    let title_str = if title.is_null() {
      "Nebulabun App"
    } else {
      CStr::from_ptr(title).to_str().unwrap_or("Nebulabun App")
    };

    // ウィンドウクラスを登録
    let class_name = w!("NebulabunWindow");
    let wc = WNDCLASSEXW {
      cbSize: std::mem::size_of::<WNDCLASSEXW>() as u32,
      style: CS_HREDRAW | CS_VREDRAW,
      lpfnWndProc: Some(window_proc),
      hInstance: GetModuleHandleW(None).unwrap(),
      hCursor: LoadCursorW(None, IDC_ARROW).unwrap(),
      hbrBackground: if transparent != 0 {
        HBRUSH(0)
      } else {
        HBRUSH(6)
      },
      lpszClassName: class_name,
      ..Default::default()
    };

    RegisterClassExW(&wc);

    // ウィンドウスタイルを設定
    let mut style = WS_OVERLAPPEDWINDOW;
    let mut ex_style = WS_EX_APPWINDOW;

    if transparent != 0 {
      ex_style |= WS_EX_LAYERED | WS_EX_TRANSPARENT;
    }

    // ウィンドウを作成
    let title_wide: Vec<u16> = title_str.encode_utf16().chain(std::iter::once(0)).collect();
    let hwnd = CreateWindowExW(
      ex_style,
      class_name,
      PCWSTR(title_wide.as_ptr()),
      style,
      CW_USEDEFAULT,
      CW_USEDEFAULT,
      width,
      height,
      None,
      None,
      GetModuleHandleW(None).unwrap(),
      None,
    );

    if hwnd.0 == 0 {
      return 0; // 失敗
    }

    // WebView2インスタンスを初期化
    WEBVIEW_INSTANCE = Some(WebViewInstance {
      hwnd,
      controller: None,
      webview: None,
    });

    // WebView2を初期化
    initialize_webview2(hwnd);

    ShowWindow(hwnd, SW_SHOW);
    UpdateWindow(hwnd);

    hwnd.0 as c_int
  }
}

// WebView2を初期化
fn initialize_webview2(hwnd: HWND) {
  // 現在は基本的なウィンドウのみ作成
  // WebView2の完全な実装は複雑なため、将来のバージョンで実装予定

  // デバッグ用: ウィンドウの背景色を設定
  unsafe {
    let brush = CreateSolidBrush(COLORREF(0x00F0F0F0)); // 薄いグレー (RGB: 240, 240, 240)
    SetClassLongPtrW(hwnd, GCLP_HBRBACKGROUND, brush.0 as isize);
    InvalidateRect(hwnd, None, TRUE);
  }
}

// HTMLコンテンツを設定
#[no_mangle]
pub extern "C" fn set_html_content(html: *const c_char) -> c_int {
  unsafe {
    if html.is_null() {
      return 0;
    }

    let html_str = CStr::from_ptr(html).to_str().unwrap_or("");

    if let Some(ref mut instance) = WEBVIEW_INSTANCE {
      if let Some(ref webview) = instance.webview {
        let html_wide: Vec<u16> = html_str.encode_utf16().chain(std::iter::once(0)).collect();
        // webview.NavigateToString(&HSTRING::from_wide(&html_wide));
        return 1;
      }
    }
    0
  }
}

// URLに移動
#[no_mangle]
pub extern "C" fn navigate_to_url(url: *const c_char) -> c_int {
  unsafe {
    if url.is_null() {
      return 0;
    }

    let url_str = CStr::from_ptr(url).to_str().unwrap_or("");

    if let Some(ref mut instance) = WEBVIEW_INSTANCE {
      if let Some(ref webview) = instance.webview {
        let url_wide: Vec<u16> = url_str.encode_utf16().chain(std::iter::once(0)).collect();
        // webview.Navigate(&HSTRING::from_wide(&url_wide));
        return 1;
      }
    }
    0
  }
}

// JavaScriptを実行
#[no_mangle]
pub extern "C" fn execute_javascript(script: *const c_char) -> c_int {
  unsafe {
    if script.is_null() {
      return 0;
    }

    let script_str = CStr::from_ptr(script).to_str().unwrap_or("");

    if let Some(ref mut instance) = WEBVIEW_INSTANCE {
      if let Some(ref webview) = instance.webview {
        let script_wide: Vec<u16> = script_str
          .encode_utf16()
          .chain(std::iter::once(0))
          .collect();
        // webview.ExecuteScript(&HSTRING::from_wide(&script_wide), None);
        return 1;
      }
    }
    0
  }
}

// ウィンドウの透明度を設定
#[no_mangle]
pub extern "C" fn set_window_transparency(alpha: c_int) -> c_int {
  unsafe {
    if let Some(ref instance) = WEBVIEW_INSTANCE {
      use windows::Win32::UI::WindowsAndMessaging::SetLayeredWindowAttributes;
      SetLayeredWindowAttributes(instance.hwnd, COLORREF(0), alpha as u8, LWA_ALPHA);
      return 1;
    }
    0
  }
}

// ウィンドウのクリック透過を設定
#[no_mangle]
pub extern "C" fn set_click_through(enabled: c_int) -> c_int {
  unsafe {
    if let Some(ref instance) = WEBVIEW_INSTANCE {
      let mut style = GetWindowLongW(instance.hwnd, GWL_EXSTYLE);
      if enabled != 0 {
        style |= WS_EX_TRANSPARENT.0 as i32;
      } else {
        style &= !(WS_EX_TRANSPARENT.0 as i32);
      }
      SetWindowLongW(instance.hwnd, GWL_EXSTYLE, style);
      return 1;
    }
    0
  }
}

// ウィンドウを閉じる
#[no_mangle]
pub extern "C" fn close_window() -> c_int {
  unsafe {
    if let Some(ref instance) = WEBVIEW_INSTANCE {
      DestroyWindow(instance.hwnd);
      return 1;
    }
    0
  }
}

// メッセージループを実行
#[no_mangle]
pub extern "C" fn run_message_loop() -> c_int {
  unsafe {
    let mut msg = MSG::default();
    while GetMessageW(&mut msg, None, 0, 0).into() {
      TranslateMessage(&msg);
      DispatchMessageW(&msg);
    }
    msg.wParam.0 as c_int
  }
}

// ウィンドウプロシージャ
unsafe extern "system" fn window_proc(
  hwnd: HWND,
  msg: u32,
  wparam: WPARAM,
  lparam: LPARAM,
) -> LRESULT {
  match msg {
    WM_DESTROY => {
      PostQuitMessage(0);
      LRESULT(0)
    }
    WM_SIZE => {
      // WebView2のサイズを調整
      if let Some(ref instance) = WEBVIEW_INSTANCE {
        if let Some(ref controller) = instance.controller {
          let mut rect = RECT::default();
          GetClientRect(hwnd, &mut rect);
          // controller.put_Bounds(rect);
        }
      }
      LRESULT(0)
    }
    _ => DefWindowProcW(hwnd, msg, wparam, lparam),
  }
}
