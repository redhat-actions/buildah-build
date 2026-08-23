import { describe, it, expect, vi, beforeEach } from "vitest";
import { kernelSupportsRootlessOverlayfs } from "./utils";

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
