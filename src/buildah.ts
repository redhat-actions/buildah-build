import * as exec from "@actions/exec";

interface Buildah {
    from(baseImage?: string): Promise<CommandResult>;
    copy(container: string, content: string): Promise<CommandResult>;
    config(container: string, setting: {}): Promise<CommandResult>;
    commit(container: string, newImageName: string, flags?: string[]): Promise<CommandResult>;
}

export interface BuildahConfigSettings {
    author?: string;
    annotation?: string;
    arch?: string;
    created_by?: string;
    entrypoint?: string[];
    labels?: string[];
    envs?: string[];
    port?: string;
}

export interface CommandSucceeeded {
    readonly succeeded: true;
    readonly output?: string;
}

export interface CommandFailed {
    readonly succeeded: false;
    readonly reason?: string;
}

export type CommandResult = CommandFailed | CommandSucceeeded;

export class BuildahCli implements Buildah {
    private executable: string;
    constructor(executable: string) {
        this.executable = executable;
    }
    async from(baseImage?: string): Promise<CommandResult> {
        if (!baseImage) {
            // find correct baseImage based on language project
        }

        return await this.execute(['from', baseImage]);
    }
    async copy(container: string, content: string, path?: string): Promise<CommandResult> {
        const args: string[] = ["copy", container, content];
        if (path) {
            args.push(path);
        }
        return await this.execute(args);
    }
    async config(container: string, settings: BuildahConfigSettings): Promise<CommandResult> {
        const args: string[] = ['config'];
        if (settings.entrypoint) {
            args.push('--entrypoint');
            args.push(...settings.entrypoint);
        }
        if (settings.port) {
            args.push('--port');
            args.push(...settings.port);
        }
        args.push(container);
        return await this.execute(args);
    }
    async commit(container: string, newImageName: string, flags: string[] = []): Promise<CommandResult> {
        const args: string[] = ["commit", ...flags, container, newImageName];
        return await this.execute(args);
    }


    private async execute(args: string[]): Promise<CommandResult> {
        if (!this.executable) {
          return Promise.reject(new Error('Unable to call buildah executable'));
        }

        let output = '';
        let error = '';
        
        const options: exec.ExecOptions = {
            listeners: {
                stdout: (data: Buffer) => {
                    output += data.toString();
                },
                stderr: (data: Buffer) => {
                    error += data.toString();
                }
            }
        };
        await exec.exec(`${this.executable}`, args, options);
        if (error) {
            return Promise.resolve({ succeeded: false, error: error });
        } 
        return Promise.resolve({ succeeded: true, output: output });
    }
}