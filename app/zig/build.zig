const std = @import("std");

pub fn build(b: *std.Build) void {
  const target = b.standardTargetOptions(.{});
  const optimize = b.standardOptimizeOption(.{});

  // zig-webui を取得
  const zig_webui = b.dependency("zig_webui", .{
    .target = target,
    .optimize = optimize,
    .enable_tls = false,
    .is_static = true,
  });

  // === 実行ファイル（zig build run 用） ===
  const exe_module = b.createModule(.{
    .root_source_file = b.path("src/main.zig"),
    .target = target,
    .optimize = optimize,
  });

  exe_module.addImport("webui", zig_webui.module("webui"));

  const exe = b.addExecutable(.{
    .name = "zig",
    .root_module = exe_module,
  });

  b.installArtifact(exe);

  const run_cmd = b.addRunArtifact(exe);
  const run_step = b.step("run", "Run the app");
  run_step.dependOn(&run_cmd.step);

  // === DLL（bun連携用） ===
  const lib_module = b.createModule(.{
    .root_source_file = b.path("src/main.zig"),
    .target = target,
    .optimize = optimize,
  });

  // webui を DLL にも追加（これが重要）
  lib_module.addImport("webui", zig_webui.module("webui"));

  const lib = b.addLibrary(.{
    .name = "nebulabun_webview",
    .root_module = lib_module,
    .linkage = .dynamic,
  });

  b.installArtifact(lib);
  // b.installArtifact(lib, b.path("zig-out/bin"));
}