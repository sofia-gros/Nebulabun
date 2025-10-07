# Nebulabun
Nebulabun is a lightweight and versatile framework for creating WebView applications.  
It allows you to embed UI built with HTML/CSS directly into your app, with support for transparent windows, click-through, and drag operations.  
Compared to Electron, it is much lighter, making it ideal for creating game overlays or handy desktop utilities quickly.  

⚠️ Development speed is very slow.  

[日本語はこちら](readme-jp.md)  

---

## Development Status & Features

### 🎯 Current Progress
This project is in its early development stage. The basic architecture and build system are complete, but full implementation of WebView2 is still in progress.

### ✅ Implemented
- [x] Project structure design
- [x] Rust + Bun FFI foundation
- [x] CLI interface
- [x] Build system
- [x] Basic window creation

### 🚧 In Progress
- [ ] Full WebView2 implementation
- [ ] HTML/CSS rendering
- [ ] JavaScript execution & API
- [ ] Transparent window
- [ ] Click-through (forward mouse events to underlying windows)

### 📋 Planned
- [ ] `.draggable` elements for window movement
- [ ] `.clickable` elements for event reflection
- [ ] DOM updates from Bun
- [ ] Event handling from Bun
- [ ] Debug mode support
- [ ] Hot reload
- [ ] Packaging feature
- [ ] Commit message guidelines

### 🤝 Contribution
Contributions are welcome, especially from those familiar with WebView2 implementation, as the project is still in its very early stage.

---

## Setup

### Requirements
- Windows 10/11  
- Bun (JavaScript runtime)  
- Rust (Cargo)  
- WebView2 Runtime  

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/nebulabun.git
cd nebulabun
```

2. Install dependencies
```bash
bun install
```

3. Setup environment
```bash
# Verify and setup environment
bun run setup
```

4. Build
```bash
# Build Rust library
cd app/rust
cargo build --release
cd ../..

# Or future unified build
# bun run build
```

---

## Usage

### Basic Usage
```bash
# Start default app (basic window only for now)
bun run start

# Open HTML file (available after WebView2 implementation)
bun run start --file ./example.html

# Start with debug mode
bun run start --debug

# Show help
bun run start --help
```

### Current Limitations
- HTML content is not rendered yet (WebView2 implementation incomplete)  
- Only basic window creation and FFI tests are available  
- Transparency and drag features are still under development  

---

## Programmatic Usage

```typescript
import { createWindow } from "./app/bun/window";

const window = createWindow({
  title: "My App",
  width: 800,
  height: 600,
  transparent: true
});

const html = `
<!DOCTYPE html>
<html>
<head>
    <title>My Nebulabun App</title>
    <style>
        .draggable { cursor: move; }
        .clickable { cursor: pointer; }
    </style>
</head>
<body>
    <div class="draggable">Drag here to move the window</div>
    <button class="clickable" onclick="Nebulabun.closeWindow()">Close</button>
</body>
</html>
`;

window.startWithHtml(html);
```

---

## Special Features

### Draggable Elements
Elements with the `.draggable` class can be used to drag the window.

### Clickable Elements
Elements with the `.clickable` class allow valid click events.

### JavaScript API
Within the window, the `window.Nebulabun` object is available:

```javascript
// Set window transparency (0-255)
Nebulabun.setTransparency(128);

// Enable click-through
Nebulabun.setClickThrough(true);

// Close the window
Nebulabun.closeWindow();
```

---

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TypeScript    │    │      Rust       │    │    WebView2     │
│     (Bun)       │◄──►│   (DLL/cdylib)  │◄──►│   (Windows)     │
│                 │    │                 │    │                 │
│ - CLI Interface │    │ - Window Mgmt   │    │ - HTML/CSS/JS   │
│ - FFI Bindings  │    │ - WebView2 API  │    │ - DOM Events    │
│ - Event Handling│    │ - Win32 API     │    │ - Transparency  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

1. **TypeScript (Bun)**: Provides CLI, user-facing interface, and calls Rust functions via FFI  
2. **Rust (DLL)**: Handles WebView2 and Win32 APIs, manages windows  
3. **WebView2**: Renders HTML/CSS/JavaScript and manages DOM events  
