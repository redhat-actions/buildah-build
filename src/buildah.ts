import * as core from "@actions/core";
import * as exec from "@actions/exec";

interface Buildah {
    buildUsingDocker(image: string, context: string, dockerFiles: string[], buildArgs: string[], useOCI: boolean): Promise<CommandResult>;
    from(baseImage: string): Promise<CommandResult>;
    copy(container: string, contentToCopy: string[]): Promise<CommandResult>;
    config(container: string, setting: {}): Promise<CommandResult>;
    commit(container: string, newImageName: string, useOCI: boolean): Promise<CommandResult>;
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

    private getImageFormatOption(useOCI: boolean): string[] {
        return [ '--format', useOCI ? 'oci' : 'docker' ];
    }

    async buildUsingDocker(image: string, context: string, dockerFiles: string[], buildArgs: string[], useOCI: boolean): Promise<CommandResult> {
        const args: string[] = ['bud'];
        dockerFiles.forEach(file => {
            args.push('-f');
            args.push(file);
        });
        buildArgs.forEach((buildArg) => {
            args.push('--build-arg');
            args.push(buildArg);
        });
        args.push(...this.getImageFormatOption(useOCI));
        args.push('-t');
        args.push(image);
        args.push(context);
        return this.execute(args);
    }

    async from(baseImage: string): Promise<CommandResult> {
        return this.execute(['from', baseImage]);
    }

    async copy(container: string, contentToCopy: string[], path?: string): Promise<CommandResult | undefined> {
        if (contentToCopy.length === 0) {
            return undefined;
        }

        core.debug('copy');
        core.debug(container);
        for (const content of contentToCopy) {
            const args: string[] = ["copy", container, content];
            if (path) {
                args.push(path);
            }
            return this.execute(args);
        }
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
        return this.execute(args);
    }

    async commit(container: string, newImageName: string, useOCI: boolean): Promise<CommandResult> {
        core.debug('commit');
        core.debug(container);
        core.debug(newImageName);
        const args: string[] = [ 'commit', ...this.getImageFormatOption(useOCI), '--squash', container, newImageName ];
        return this.execute(args);
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
          throw new Error('Unable to call buildah executable');
        }

        let stdOut = '';
        let stdErr = '';

        const options: exec.ExecOptions = {};
        options.listeners = {
            stdout: (data: Buffer): void => {
                stdOut += data.toString();
            },
            stderr: (data: Buffer): void => {
                stdErr += data.toString();
            }
        };
        const exitCode = await exec.exec(this.executable, args, options);
        if (exitCode !== 0) {
            throw new Error(`Buildah exited with code ${exitCode}`);
        }
        return {
            exitCode, output: stdOut, error: stdErr
        };
    }
}
