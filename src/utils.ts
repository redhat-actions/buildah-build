import * as ini from "ini";
import { promises as fs } from "fs";
import * as core from "@actions/core";
import * as path from "path";

async function findStorageDriver(filePaths: string[]): Promise<string> {
    let storageDriver = "";

    for (const filePath of filePaths) {
        core.debug(`Checking if the storage file exists at ${filePath}`);
        if (await fileExists(filePath)) {
            core.debug(`Storage file exists at ${filePath}`);
            const fileContent = ini.parse(await fs.readFile(filePath, "utf-8"));
            storageDriver = fileContent.storage.driver;
        }
    }
    return storageDriver;
}

export async function checkStorageDriver(): Promise<boolean> {
    let xdgConfigHome = "~/.config";
    if (process.env.XDG_CONFIG_HOME) {
        xdgConfigHome = process.env.XDG_CONFIG_HOME;
    }
    const filePaths: string[] = [ "/etc/containers/storage.conf",
        path.join(xdgConfigHome, "containers/storage.conf"),
    ];
    const storageDriver = await findStorageDriver(filePaths);
    return (storageDriver === "overlay");
}

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    }
    catch (err) {
        return false;
    }
}
