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
import { Inputs } from "./generated/inputs-outputs";

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

export function getArch(): string {
    // 'arch' should be used over 'archs', see https://github.com/redhat-actions/buildah-build/issues/60
    const archs = core.getInput(Inputs.ARCHS);
    const arch = core.getInput(Inputs.ARCH);

    if (arch && archs) {
        core.warning(
            `Both "${Inputs.ARCH}" and "${Inputs.ARCHS}" inputs are set. `
            + `Please use only one of these two inputs, as they are aliases of one another. `
            + `"${Inputs.ARCH}" takes precedence.`
        );
    }

    return arch || archs;
}

export function getContainerfiles(): string[] {
    // 'containerfile' should be used over 'dockerfile',
    // see https://github.com/redhat-actions/buildah-build/issues/57
    const containerfiles = getInputList(Inputs.CONTAINERFILES);
    const dockerfiles = getInputList(Inputs.DOCKERFILES);

    if (containerfiles.length !== 0 && dockerfiles.length !== 0) {
        core.warning(
            `Both "${Inputs.CONTAINERFILES}" and "${Inputs.DOCKERFILES}" inputs are set. `
            + `Please use only one of these two inputs, as they are aliases of one another. `
            + `"${Inputs.CONTAINERFILES}" takes precedence.`
        );
    }

    return containerfiles.length !== 0 ? containerfiles : dockerfiles;
}

export function getInputList(name: string): string[] {
    const items = core.getInput(name);
    if (!items) {
        return [];
    }
    const splitItems = splitByNewline(items);
    return splitItems
        .reduce<string[]>(
            (acc, line) => acc.concat(line).map((item) => item.trim()),
            [],
        );
}

export function isFullImageName(image: string): boolean {
    return image.indexOf(":") > 0;
}

export function getFullImageName(image: string, tag: string): string {
    if (isFullImageName(tag)) {
        return tag;
    }
    return `${image}:${tag}`;
}
