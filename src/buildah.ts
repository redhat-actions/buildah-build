import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";
import * as path from "path";
import CommandResult from "./types";
import { checkStorageDriver } from "./utils";

export interface BuildahConfigSettings {
    entrypoint?: string[];
    envs?: string[];
    port?: string;
    workingdir?: string;
    archs?: string;
}

interface Buildah {
    buildUsingDocker(
        image: string, context: string, dockerFiles: string[], buildArgs: string[],
        useOCI: boolean, archs: string, layers: string
    ): Promise<CommandResult>;
    from(baseImage: string): Promise<CommandResult>;
    copy(container: string, contentToCopy: string[]): Promise<CommandResult | undefined>;
    config(container: string, setting: BuildahConfigSettings): Promise<CommandResult>;
    commit(container: string, newImageName: string, useOCI: boolean): Promise<CommandResult>;
}

export class BuildahCli implements Buildah {
    private readonly executable: string;

    public storageOptsEnv = "";

    constructor(executable: string) {
        this.executable = executable;
    }

    async checkFuseOverlayfs(): Promise<void> {
        const fuseOverlayfsPath = await io.which("fuse-overlayfs");

        if (fuseOverlayfsPath.startsWith("/usr/bin")) {
            if (await checkStorageDriver()) {
                this.storageOptsEnv = "overlay.mount_program=/usr/bin/fuse-overlayfs";
            }
        }
    }

    private static getImageFormatOption(useOCI: boolean): string[] {
        return [ "--format", useOCI ? "oci" : "docker" ];
    }

    async buildUsingDocker(
        image: string, context: string, dockerFiles: string[], buildArgs: string[],
        useOCI: boolean, archs: string, layers: string
    ): Promise<CommandResult> {
        const args: string[] = [ "bud" ];
        if (archs) {
            args.push("--arch");
            args.push(archs);
        }
        dockerFiles.forEach((file) => {
            args.push("-f");
            args.push(file);
        });
        buildArgs.forEach((buildArg) => {
            args.push("--build-arg");
            args.push(buildArg);
        });
        args.push(...BuildahCli.getImageFormatOption(useOCI));
        if (layers) {
            args.push(`--layers=${layers}`);
        }
        args.push("-t");
        args.push(image);
        args.push(context);
        return this.execute(args);
    }

    async from(baseImage: string): Promise<CommandResult> {
        return this.execute([ "from", baseImage ]);
    }

    async copy(container: string, contentToCopy: string[], contentPath?: string): Promise<CommandResult | undefined> {
        if (contentToCopy.length === 0) {
            return undefined;
        }

        core.debug("copy");
        core.debug(container);
        for (const content of contentToCopy) {
            const args: string[] = [ "copy", container, content ];
            if (contentPath) {
                args.push(contentPath);
            }
            return this.execute(args);
        }

        return undefined;
    }

    async config(container: string, settings: BuildahConfigSettings): Promise<CommandResult> {
        core.debug("config");
        core.debug(container);
        const args: string[] = [ "config" ];
        if (settings.entrypoint) {
            args.push("--entrypoint");
            args.push(BuildahCli.convertArrayToStringArg(settings.entrypoint));
        }
        if (settings.port) {
            args.push("--port");
            args.push(settings.port);
        }
        if (settings.envs) {
            settings.envs.forEach((env) => {
                args.push("--env");
                args.push(env);
            });
        }
        if (settings.archs) {
            args.push("--arch");
            args.push(settings.archs);
        }
        if (settings.workingdir) {
            args.push("--workingdir");
            args.push(settings.workingdir);
        }
        args.push(container);
        return this.execute(args);
    }

    async commit(container: string, newImageName: string, useOCI: boolean): Promise<CommandResult> {
        core.debug("commit");
        core.debug(container);
        core.debug(newImageName);
        const args: string[] = [
            "commit", ...BuildahCli.getImageFormatOption(useOCI),
            "--squash", container, newImageName,
        ];
        return this.execute(args);
    }

    async tag(imageName: string, tags: string[]): Promise<CommandResult> {
        const args: string[] = [ "tag" ];
        for (const tag of tags) {
            args.push(`${imageName}:${tag}`);
        }
        core.info(`Tagging the built image with tags ${tags.toString()}`);
        return this.execute(args);
    }

    private static convertArrayToStringArg(args: string[]): string {
        let arrayAsString = "[";
        args.forEach((arg) => {
            arrayAsString += `"${arg}",`;
        });
        return `${arrayAsString.slice(0, -1)}]`;
    }

    async execute(args: string[], execOptions: exec.ExecOptions = {}): Promise<CommandResult> {
        // ghCore.info(`${EXECUTABLE} ${args.join(" ")}`)

        let stdout = "";
        let stderr = "";

        const finalExecOptions = { ...execOptions };
        finalExecOptions.ignoreReturnCode = true;     // the return code is processed below

        finalExecOptions.listeners = {
            stdline: (line): void => {
                stdout += line + "\n";
            },
            errline: (line):void => {
                stderr += line + "\n";
            },
        };

        // To solve https://github.com/redhat-actions/buildah-build/issues/45

        if (this.storageOptsEnv) {
            finalExecOptions.env = {
                ...process.env,
                STORAGE_OPTS: this.storageOptsEnv,
            };
        }

        const exitCode = await exec.exec(this.executable, args, finalExecOptions);

        if (execOptions.ignoreReturnCode !== true && exitCode !== 0) {
            // Throwing the stderr as part of the Error makes the stderr
            // show up in the action outline, which saves some clicking when debugging.
            let error = `${path.basename(this.executable)} exited with code ${exitCode}`;
            if (stderr) {
                error += `\n${stderr}`;
            }
            throw new Error(error);
        }

        return {
            exitCode, output: stdout, error: stderr,
        };
    }
}
