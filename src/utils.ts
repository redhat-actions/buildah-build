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
        if (err instanceof Error) {
            core.debug(err.message);
        }
    }

    return fuseOverlayfsPath;
}

export function splitByNewline(s: string): string[] {
    return s.split(/\r?\n/);
}

export function getArch(): string[] {
    const archs = getCommaSeperatedInput(Inputs.ARCHS);

    const arch = core.getInput(Inputs.ARCH);

    if (arch && archs.length > 0) {
        core.warning(
            `Both "${Inputs.ARCH}" and "${Inputs.ARCHS}" inputs are set. `
            + `Please use "${Inputs.ARCH}" if you want to provide multiple `
            + `ARCH else use ${Inputs.ARCH}". "${Inputs.ARCHS}" takes preference.`
        );
    }

    if (archs.length > 0) {
        return archs;
    }
    else if (arch) {
        return [ arch ];
    }
    return [];
}

export function getPlatform(): string[] {
    const platform = core.getInput(Inputs.PLATFORM);
    const platforms = getCommaSeperatedInput(Inputs.PLATFORMS);

    if (platform && platforms.length > 0) {
        core.warning(
            `Both "${Inputs.PLATFORM}" and "${Inputs.PLATFORMS}" inputs are set. `
            + `Please use "${Inputs.PLATFORMS}" if you want to provide multiple `
            + `PLATFORM else use ${Inputs.PLATFORM}". "${Inputs.PLATFORMS}" takes preference.`
        );
    }

    if (platforms.length > 0) {
        core.debug("return platforms");
        return platforms;
    }
    else if (platform) {
        core.debug("return platform");
        return [ platform ];
    }
    core.debug("return empty");
    return [];
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

export function getCommaSeperatedInput(name: string): string[] {
    const items = core.getInput(name);
    if (items.length === 0) {
        core.debug("empty");
        return [];
    }
    const splitItems = items.split(",");
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

export function removeIllegalCharacters(item: string): string {
    return item.replace(/[^a-zA-Z0-9 ]/g, "");
}
