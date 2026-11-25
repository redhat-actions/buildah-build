import { describe, it, expect, vi, beforeEach } from "vitest";
import { kernelSupportsRootlessOverlayfs, SemVer } from "./utils";

vi.mock("@actions/core", () => ({
    info: vi.fn(),
    debug: vi.fn(),
    warning: vi.fn(),
    getInput: vi.fn(),
}));

const osMock = vi.hoisted(() => ({
    homedir: vi.fn(() => "/home/runner"),
    release: vi.fn(() => "6.5.0-44-generic"),
}));

vi.mock("os", async (importOriginal) => {
    const actual = await importOriginal<typeof import("os")>();
    return { ...actual, ...osMock };
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe("kernelSupportsRootlessOverlayfs", () => {
    it("returns true for kernel 5.11+", () => {
        osMock.release.mockReturnValue("5.11.0-generic");
        expect(kernelSupportsRootlessOverlayfs()).toBe(true);
    });

    it("returns true for kernel 5.15", () => {
        osMock.release.mockReturnValue("5.15.0-1022-aws");
        expect(kernelSupportsRootlessOverlayfs()).toBe(true);
    });

    it("returns true for kernel 6.x", () => {
        osMock.release.mockReturnValue("6.5.0-44-generic");
        expect(kernelSupportsRootlessOverlayfs()).toBe(true);
    });

    it("returns false for kernel 5.10", () => {
        osMock.release.mockReturnValue("5.10.0-generic");
        expect(kernelSupportsRootlessOverlayfs()).toBe(false);
    });

    it("returns false for kernel 4.x", () => {
        osMock.release.mockReturnValue("4.15.0-213-generic");
        expect(kernelSupportsRootlessOverlayfs()).toBe(false);
    });

    it("returns false for unparseable release string", () => {
        osMock.release.mockReturnValue("unknown");
        expect(kernelSupportsRootlessOverlayfs()).toBe(false);
    });
});

describe("SemVer.parse", () => {
    it("return buildah version", () => {
        const VERSION = `
            Version:         1.46.1
            Go Version:      go1.27.3-X:nodwarf5
            Image Spec:      1.1.1
            Runtime Spec:    1.3.0
            image Version:   5.42.1
            Git Commit:
            Built:           Wed Nov 11 22:54:37 2026
            OS/Arch:         linux/amd64
            BuildPlatform:   linux/amd64
        `;

        expect(SemVer.parse(VERSION)).toStrictEqual(new SemVer(1, 46, 1));
        expect(SemVer.parse(VERSION)?.compare(new SemVer(1, 35, 0))).toBe(1);
    });

    it("return podman version", () => {
        const VERSION = `
            Client:        Podman Engine
            Version:       6.2.0
            API Version:   6.2.0
            Go Version:    go1.27.3-X:nodwarf5
            Git Commit:    055de046937d29450f310fce0fe3071485d8bed9
            Built:         Tue Nov 10 09:00:00 2026
            Build Origin:  Fedora Project
            OS/Arch:       linux/amd64
        `;

        expect(SemVer.parse(VERSION)).toStrictEqual(new SemVer(6, 2, 0));
        expect(SemVer.parse(VERSION)?.compare(new SemVer(5, 0, 0))).toBe(1);
    });

    it("fail parse invalid version", () => {
        const VERSION = `
            Client Version:1.32.2
            Server Version:1.36.5
        `;

        expect(SemVer.parse(VERSION)).toBeNull();
    });
});
