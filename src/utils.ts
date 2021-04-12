/***************************************************************************************************
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

import * as ini from "ini";
import { promises as fs } from "fs";
import * as core from "@actions/core";
import * as path from "path";
import * as io from "@actions/io";
import * as os from "os";

async function findStorageDriver(filePaths: string[]): Promise<string> {
    let storageDriver = "";
    for (const filePath of filePaths) {
        core.debug(`Checking if the storage file exists at ${filePath}`);
        if (await fileExists(filePath)) {
            core.debug(`Storage file exists at ${filePath}`);
            const fileContent = ini.parse(await fs.readFile(filePath, "utf-8"));
            if (fileContent.storage.driver) {
                storageDriver = fileContent.storage.driver;
            }
        }
    }
    return storageDriver;
}

export async function isStorageDriverOverlay(): Promise<boolean> {
    let xdgConfigHome = path.join(os.homedir(), ".config");
    if (process.env.XDG_CONFIG_HOME) {
        xdgConfigHome = process.env.XDG_CONFIG_HOME;
    }
    const filePaths: string[] = [
        "/etc/containers/storage.conf",
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

export async function findFuseOverlayfsPath(): Promise<string | undefined> {
    let fuseOverlayfsPath;
    try {
        fuseOverlayfsPath = await io.which("fuse-overlayfs");
    }
    catch (err) {
        core.debug(err);
    }

    return fuseOverlayfsPath;
}

export function splitByNewline(s: string): string[] {
    return s.split(/\r?\n/);
}
