const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const lib = b.addLibrary(.{
        .name = "nebulabun_webview",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/webview.zig"),
            .target = target,
            .optimize = optimize,
        }),
        .linkage = .dynamic,
    });

    b.installArtifact(lib);

    // Install webui-2.dll alongside our DLL (required at runtime)
    const dll_install = b.addInstallFile(
        b.path("../../app/webui/webui-windows-msvc-x64/webui-2.dll"),
        "bin/webui-2.dll",
    );
    b.getInstallStep().dependOn(&dll_install.step);
}
