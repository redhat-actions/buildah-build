export interface CommandSucceeeded {
    readonly succeeded: true;
    readonly output?: string;
}

export interface CommandFailed {
    readonly succeeded: false;
    readonly reason?: string;
}

export type CommandResult = CommandFailed | CommandSucceeeded;