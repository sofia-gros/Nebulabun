import { dlopen, FFIType, suffix } from "bun:ffi";
import { join } from "path";

const libPath = join(
  process.cwd(),
  "app", "zig", "zig-out", "bin",
  `nebulabun_simple.${suffix}`
);

console.log(`Loading: ${libPath}`);

const lib = dlopen(libPath, {
  add: {
    args: [FFIType.i32, FFIType.i32],
    returns: FFIType.i32,
  },
  multiply: {
    args: [FFIType.i32, FFIType.i32],
    returns: FFIType.i32,
  },
});

// Test add
const sum = lib.symbols.add(10, 20);
console.log(`add(10, 20) = ${sum}`); // 30

// Test multiply
const product = lib.symbols.multiply(6, 7);
console.log(`multiply(6, 7) = ${product}`); // 42

console.log("✅ bun → zig FFI 成功!");