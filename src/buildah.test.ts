import { describe, it, expect, vi, beforeEach } from "vitest";

const coreMock = vi.hoisted(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warning: vi.fn(),
    startGroup: vi.fn(),
    endGroup: vi.fn(),
}));

vi.mock("@actions/core", () => coreMock);

type ExecCall = { executable: string; args: string[]; options?: Record<string, unknown> };
type ExecImpl = (executable: string, args: string[], options?: Record<string, unknown>) => Promise<number>;

let execCallLog: ExecCall[] = [];
let execMockImpl: ExecImpl = () => Promise.resolve(0);

vi.mock("@actions/exec", () => ({
    exec: vi.fn((executable: string, args: string[], options?: Record<string, unknown>) => {
        execCallLog.push({ executable, args, options });
        return execMockImpl(executable, args, options);
    }),
}));

import { BuildahCli } from "./buildah";

function setExecMock(impl: ExecImpl): void {
    execMockImpl = impl;
}

function findExecCall(predicate: (call: ExecCall) => boolean): ExecCall | undefined {
    return execCallLog.find(predicate);
}

beforeEach(() => {
    vi.clearAllMocks();
    execCallLog = [];
    execMockImpl = () => Promise.resolve(0);
});

describe("BuildahCli container mode", () => {
    const PODMAN = "/usr/bin/podman";
    const WORKSPACE = "/home/runner/work/my-repo/my-repo";
    const IMAGE = "quay.io/buildah/stable";

    function makePodmanInfoMock(graphRoot: string): ExecImpl {
        return (_executable, args, options) => {
            if (args[0] === "info") {
                const listeners = (options as { listeners?: { stdline?: (line: string) => void } })?.listeners;
                listeners?.stdline?.(graphRoot);
                return Promise.resolve(0);
            }
            return Promise.resolve(0);
        };
    }

    it("uses detected graphRoot in volume mount", async () => {
        const graphRoot = "/home/runner/.local/share/containers/storage";
        setExecMock(makePodmanInfoMock(graphRoot));

        const cli = new BuildahCli("/usr/bin/buildah");
        await cli.enableContainerMode(IMAGE, PODMAN, WORKSPACE);
        await cli.execute(["version"]);

        const runCall = findExecCall((c) => c.executable === PODMAN && c.args[0] === "run");
        expect(runCall).toBeDefined();
        expect(runCall!.args).toContain(`${graphRoot}:${graphRoot}`);
        expect(runCall!.args).not.toContain(
            "/var/lib/containers/storage:/var/lib/containers/storage",
        );
    });

    it("falls back to default path when podman info fails", async () => {
        setExecMock((_executable, args) => {
            if (args[0] === "info") {
                return Promise.resolve(1);
            }
            return Promise.resolve(0);
        });

        const cli = new BuildahCli("/usr/bin/buildah");
        await cli.enableContainerMode(IMAGE, PODMAN, WORKSPACE);
        await cli.execute(["version"]);

        expect(coreMock.warning).toHaveBeenCalledWith(
            expect.stringContaining("Could not detect container storage root"),
        );

        const runCall = findExecCall((c) => c.executable === PODMAN && c.args[0] === "run");
        expect(runCall).toBeDefined();
        expect(runCall!.args).toContain(
            "/var/lib/containers/storage:/var/lib/containers/storage",
        );
    });

    it("falls back to default path when podman info throws", async () => {
        setExecMock((_executable, args) => {
            if (args[0] === "info") {
                return Promise.reject(new Error("podman not found"));
            }
            return Promise.resolve(0);
        });

        const cli = new BuildahCli("/usr/bin/buildah");
        await cli.enableContainerMode(IMAGE, PODMAN, WORKSPACE);

        expect(coreMock.warning).toHaveBeenCalledWith(
            expect.stringContaining("Could not detect container storage root"),
        );
    });

    it("passes correct podman run flags", async () => {
        setExecMock(makePodmanInfoMock("/var/lib/containers/storage"));

        const cli = new BuildahCli("/usr/bin/buildah");
        await cli.enableContainerMode(IMAGE, PODMAN, WORKSPACE);
        await cli.execute(["version"]);

        const runCall = findExecCall((c) => c.executable === PODMAN && c.args[0] === "run");
        expect(runCall).toBeDefined();
        const args = runCall!.args;

        expect(args).toContain("--rm");
        expect(args).toContain("--privileged");
        expect(args[args.indexOf("--network") + 1]).toBe("host");
        expect(args[args.indexOf("--security-opt") + 1]).toBe("label=disable");
        expect(args).toContain(`${WORKSPACE}:${WORKSPACE}`);
        expect(args).toContain(IMAGE);
        expect(args).toContain("buildah");
        expect(args).toContain("version");
    });

    it("does not set STORAGE_OPTS in container mode", async () => {
        setExecMock(makePodmanInfoMock("/var/lib/containers/storage"));

        const cli = new BuildahCli("/usr/bin/buildah");
        cli.storageOptsEnv = "overlay.mount_program=/usr/bin/fuse-overlayfs";
        await cli.enableContainerMode(IMAGE, PODMAN, WORKSPACE);
        await cli.execute(["version"]);

        const runCall = findExecCall((c) => c.executable === PODMAN && c.args[0] === "run");
        expect(runCall).toBeDefined();
        const env = (runCall!.options as { env?: Record<string, string> })?.env;
        expect(env?.STORAGE_OPTS).toBeUndefined();
    });
});

describe("BuildahCli non-container mode", () => {
    it("executes buildah directly without podman wrapping", async () => {
        setExecMock(() => Promise.resolve(0));

        const cli = new BuildahCli("/usr/bin/buildah");
        await cli.execute(["version"]);

        const call = findExecCall((c) => c.executable === "/usr/bin/buildah");
        expect(call).toBeDefined();
        expect(call!.args).toEqual(["version"]);

        const podmanRun = findExecCall(
            (c) => c.args[0] === "run" && c.args.includes("--privileged"),
        );
        expect(podmanRun).toBeUndefined();
    });

    it("sets STORAGE_OPTS when configured", async () => {
        setExecMock(() => Promise.resolve(0));

        const cli = new BuildahCli("/usr/bin/buildah");
        cli.storageOptsEnv = "overlay.mount_program=/usr/bin/fuse-overlayfs";
        await cli.execute(["version"]);

        const call = findExecCall((c) => c.executable === "/usr/bin/buildah");
        expect(call).toBeDefined();
        const env = (call!.options as { env?: Record<string, string> })?.env;
        expect(env?.STORAGE_OPTS).toBe("overlay.mount_program=/usr/bin/fuse-overlayfs");
    });
});
