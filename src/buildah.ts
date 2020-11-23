import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { CommandResult } from "./types";

interface Buildah {
    buildUsingDocker(image: string, context: string, dockerFiles: string[], buildArgs: string[]): Promise<CommandResult>;
    from(baseImage: string): Promise<CommandResult>;
    copy(container: string, contentToCopy: string[]): Promise<CommandResult>;
    config(container: string, setting: {}): Promise<CommandResult>;
    commit(container: string, newImageName: string, flags?: string[]): Promise<CommandResult>;
}

export interface BuildahConfigSettings {
    entrypoint?: string[];
    envs?: string[];
    port?: string;
    workingdir?: string;
}

export class BuildahCli implements Buildah {

    private executable: string;

    constructor(executable: string) {
        this.executable = executable;
    }

    async buildUsingDocker(image: string, context: string, dockerFiles: string[], buildArgs: string[]): Promise<CommandResult> {
        const args: string[] = ['bud'];
        dockerFiles.forEach(file => {
            args.push('-f');
            args.push(file);
        });
        buildArgs.forEach((buildArg) => {
            args.push('--build-arg');
            args.push(buildArg);
        })
        args.push('-t');
        args.push(image);
        args.push(context);
        return await this.execute(args);
    }

    async from(baseImage: string): Promise<CommandResult> {
        return await this.execute(['from', baseImage]);
    }

    async copy(container: string, contentToCopy: string[], path?: string): Promise<CommandResult> {
        core.debug('copy');
        core.debug(container);
        let result: CommandResult;
        for (const content of contentToCopy) {
            const args: string[] = ["copy", container, content];
            if (path) {
                args.push(path);
            }
            result = await this.execute(args);
            if (result.succeeded === false) {
                return result;
            }
        }

        return result;
    }

    async config(container: string, settings: BuildahConfigSettings): Promise<CommandResult> {
        core.debug('config');
        core.debug(container);
        const args: string[] = ['config'];
        if (settings.entrypoint) {
            args.push('--entrypoint');
            args.push(this.convertArrayToStringArg(settings.entrypoint));
        }
        if (settings.port) {
            args.push('--port');
            args.push(settings.port);
        }
        if (settings.envs) {
            settings.envs.forEach((env) => {
                args.push('--env');
                args.push(env);
            });
        }
        args.push(container);
        return await this.execute(args);
    }

    async commit(container: string, newImageName: string, flags: string[] = []): Promise<CommandResult> {
        core.debug('commit');
        core.debug(container);
        core.debug(newImageName);
        const args: string[] = ["commit", ...flags, container, newImageName];
        return await this.execute(args);
    }

    private convertArrayToStringArg(args: string[]): string {
        let arrayAsString = '[';
        args.forEach(arg => {
            arrayAsString += `"${arg}",`;
        });
        return `${arrayAsString.slice(0, -1)}]`;
    }

    private async execute(args: string[]): Promise<CommandResult> {
        if (!this.executable) {
          return Promise.reject(new Error('Unable to call buildah executable'));
        }

        let output = '';
        let error = '';

        const options: exec.ExecOptions = {};
        options.listeners = {
            stdout: (data: Buffer): void => {
                output += data.toString();
            },
            stderr: (data: Buffer): void => {
                error += data.toString();
            }
        };
        const exitCode = await exec.exec(this.executable, args, options);
        if (exitCode === 1) {
            return Promise.resolve({ succeeded: false, error });
        }
        return Promise.resolve({ succeeded: true, output });
    }
}
