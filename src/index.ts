/***************************************************************************************************
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

import * as core from "@actions/core";
import * as io from "@actions/io";
import * as fs from "fs";
import * as path from "path";
import { Inputs, Outputs } from "./generated/inputs-outputs";
import { BuildahCli, BuildahConfigSettings } from "./buildah";
import {
    getArch, getPlatform, getContainerfiles, getInputList, splitByNewline,
    isFullImageName, getFullImageName, removeIllegalCharacters,
} from "./utils";

export async function run(): Promise<void> {
    if (process.env.RUNNER_OS !== "Linux") {
        throw new Error("buildah, and therefore this action, only works on Linux. Please use a Linux runner.");
    }

    // get buildah cli
    const buildahPath = await io.which("buildah", true);
    const cli: BuildahCli = new BuildahCli(buildahPath);

    // Check if user wants to run buildah from a container image
    const buildahImage = core.getInput(Inputs.BUILDAH_IMAGE);
    if (buildahImage) {
        const podmanPath = await io.which("podman", true);
        const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
        await cli.enableContainerMode(buildahImage, podmanPath, workspace);
    }

    // print buildah version
    await cli.execute([ "version" ], { group: true });

    // Check if fuse-overlayfs exists and find the storage driver
    if (!buildahImage) {
        await cli.setStorageOptsEnv();
    }

    const DEFAULT_TAG = "latest";
    const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
    const containerFiles = getContainerfiles();
    const image = core.getInput(Inputs.IMAGE);
    const tags = core.getInput(Inputs.TAGS);
    const tagsList: string[] = tags.trim().split(/\s+/);
    const labels = core.getInput(Inputs.LABELS);
    const labelsList: string[] = labels ? splitByNewline(labels) : [];
    const annotations = core.getInput(Inputs.ANNOTATIONS);
    const annotationsList: string[] = annotations ? splitByNewline(annotations) : [];

    const normalizedTagsList: string[] = [];
    let isNormalized = false;
    for (const tag of tagsList) {
        normalizedTagsList.push(tag.toLowerCase());
        if (tag.toLowerCase() !== tag) {
            isNormalized = true;
        }
    }
    const normalizedImage = image.toLowerCase();
    if (isNormalized || image !== normalizedImage) {
        core.warning(`Reference to image and/or tag must be lowercase.`
        + ` Reference has been converted to be compliant with standard.`);
    }

    // info message if user doesn't provides any tag
    if (tagsList.length === 0) {
        core.info(`Input "${Inputs.TAGS}" is not provided, using default tag "${DEFAULT_TAG}"`);
        tagsList.push(DEFAULT_TAG);
    }

    const inputExtraArgsStr = core.getInput(Inputs.EXTRA_ARGS);
    let buildahExtraArgs: string[] = [];
    if (inputExtraArgsStr) {
        // transform the array of lines into an array of arguments
        // by splitting over lines, then over spaces, then trimming.
        const lines = splitByNewline(inputExtraArgsStr);
        buildahExtraArgs = lines.flatMap((line) => line.split(" ")).map((arg) => arg.trim());
    }

    // check if all tags provided are in `image:tag` format
    const isFullImageNameTag = isFullImageName(normalizedTagsList[0]);
    if (normalizedTagsList.some((tag) => isFullImageName(tag) !== isFullImageNameTag)) {
        throw new Error(`Input "${Inputs.TAGS}" cannot have a mix of full name and non full name tags. Refer to https://github.com/redhat-actions/buildah-build#image-tag-inputs`);
    }
    if (!isFullImageNameTag && !normalizedImage) {
        throw new Error(`Input "${Inputs.IMAGE}" must be provided when not using full image name tags. Refer to https://github.com/redhat-actions/buildah-build#image-tag-inputs`);
    }

    const newImage = getFullImageName(normalizedImage, normalizedTagsList[0]);
    const useOCI = core.getInput(Inputs.OCI) === "true";

    const archs = getArch();
    const platforms = getPlatform();

    if ((archs.length > 0) && (platforms.length > 0)) {
        throw new Error("The --platform option may not be used in combination with the --arch option.");
    }

    const builtImage = [];
    if (containerFiles.length !== 0) {
        builtImage.push(...await doBuildUsingContainerFiles(
            cli,
            newImage,
            workspace,
            containerFiles,
            useOCI,
            archs,
            platforms,
            labelsList,
            annotationsList,
            buildahExtraArgs
        ));
    }
    else {
        if (platforms.length > 0) {
            throw new Error("The --platform option is not supported for builds without containerfiles.");
        }
        builtImage.push(...await doBuildFromScratch(cli, newImage, useOCI, archs, labelsList, buildahExtraArgs));
    }

    if ((archs.length > 1) || (platforms.length > 1)) {
        core.info(`Creating manifest with tag${normalizedTagsList.length !== 1 ? "s" : ""} `
            + `"${normalizedTagsList.join(", ")}"`);
        const builtManifest = [];
        for (const tag of normalizedTagsList) {
            const manifestName = getFullImageName(normalizedImage, tag);
            // Force-remove existing manifest to prevent errors on recurring build on the same machine
            await cli.manifestRm(manifestName);
            await cli.manifestCreate(manifestName);
            builtManifest.push(manifestName);

            for (const arch of archs) {
                const tagSuffix = removeIllegalCharacters(arch);
                await cli.manifestAdd(manifestName, `${newImage}-${tagSuffix}`);
            }

            for (const platform of platforms) {
                const tagSuffix = removeIllegalCharacters(platform);
                await cli.manifestAdd(manifestName, `${newImage}-${tagSuffix}`);
            }
        }

        core.info(`✅ Successfully built image${builtImage.length !== 1 ? "s" : ""} "${builtImage.join(", ")}" `
            + `and manifest${builtManifest.length !== 1 ? "s" : ""} "${builtManifest.join(", ")}"`);
    }
    else if (normalizedTagsList.length > 1) {
        await cli.tag(normalizedImage, normalizedTagsList);
    }
    else if (normalizedTagsList.length === 1) {
        core.info(`✅ Successfully built image "${getFullImageName(normalizedImage, normalizedTagsList[0])}"`);
    }

    // Get the digest of the built image
    const inspectResult = await cli.inspect(newImage);
    const digest = inspectResult.output.trim();

    core.setOutput(Outputs.IMAGE, normalizedImage);
    core.setOutput(Outputs.TAGS, tags);
    core.setOutput(Outputs.IMAGE_WITH_TAG, newImage);
    core.setOutput(Outputs.DIGEST, digest);
}

async function verifyImageArch(cli: BuildahCli, image: string, expectedArch: string): Promise<void> {
    try {
        const result = await cli.inspectArch(image);
        const actualArch = result.output.trim();
        if (actualArch && actualArch !== expectedArch) {
            core.warning(
                `Image "${image}" was requested for architecture "${expectedArch}" `
                + `but was actually built for "${actualArch}". `
                + `This usually means the base image does not support the "${expectedArch}" architecture. `
                + `The resulting image will not run correctly on ${expectedArch} systems.`
            );
        }
    }
    catch (_err) {
        // Don't fail the build if arch verification fails — it's a best-effort check
        core.debug(`Could not verify architecture for image "${image}"`);
    }
}

async function doBuildUsingContainerFiles(
    cli: BuildahCli,
    newImage: string,
    workspace: string,
    containerFiles: string[],
    useOCI: boolean,
    archs: string[],
    platforms: string[],
    labels: string[],
    annotations: string[],
    extraArgs: string[]
): Promise<string[]> {
    if (containerFiles.length === 1) {
        core.info(`Performing build from Containerfile`);
    }
    else {
        core.info(`Performing build from ${containerFiles.length} Containerfiles`);
    }

    const context = path.join(workspace, core.getInput(Inputs.CONTEXT));
    const buildArgs = getInputList(Inputs.BUILD_ARGS);
    const containerFileAbsPaths = containerFiles.map((file) => {
        // If the path is absolute, use it as-is
        if (path.isAbsolute(file)) {
            return file;
        }
        // Check if the file exists relative to the workspace (backward compat)
        const workspacePath = path.join(workspace, file);
        if (fs.existsSync(workspacePath)) {
            return workspacePath;
        }
        // Otherwise, resolve relative to the context directory (Docker-compatible behavior)
        const contextPath = path.join(context, file);
        if (fs.existsSync(contextPath)) {
            core.info(`Resolved containerfile "${file}" relative to context directory "${context}"`);
            return contextPath;
        }
        // Fall back to workspace-relative path and let buildah report the error
        return workspacePath;
    });
    const layers = core.getInput(Inputs.LAYERS);
    const tlsVerify = core.getInput(Inputs.TLS_VERIFY) === "true";

    const builtImage: string[] = [];
    // since multi arch image can not have same tag
    // therefore, appending arch/platform in the tag
    if (archs.length > 0 || platforms.length > 0) {
        // Build all architectures in parallel for faster multi-arch builds
        const archBuilds = archs.map(async (arch) => {
            let tagSuffix = "";
            if (archs.length > 1) {
                tagSuffix = `-${removeIllegalCharacters(arch)}`;
            }
            const imageTag = `${newImage}${tagSuffix}`;
            await cli.buildUsingDocker(
                imageTag,
                context,
                containerFileAbsPaths,
                buildArgs,
                useOCI,
                labels,
                annotations,
                layers,
                extraArgs,
                tlsVerify,
                arch
            );
            await verifyImageArch(cli, imageTag, arch);
            return imageTag;
        });

        const platformBuilds = platforms.map(async (platform) => {
            let tagSuffix = "";
            if (platforms.length > 1) {
                tagSuffix = `-${removeIllegalCharacters(platform)}`;
            }
            const imageTag = `${newImage}${tagSuffix}`;
            // Platform format is os/arch (e.g., linux/arm64)
            const expectedArch = platform.includes("/") ? platform.split("/")[1] : platform;
            await cli.buildUsingDocker(
                imageTag,
                context,
                containerFileAbsPaths,
                buildArgs,
                useOCI,
                labels,
                annotations,
                layers,
                extraArgs,
                tlsVerify,
                undefined,
                platform
            );
            await verifyImageArch(cli, imageTag, expectedArch);
            return imageTag;
        });

        const results = await Promise.all([ ...archBuilds, ...platformBuilds ]);
        builtImage.push(...results);
    }

    else if (archs.length === 1 || platforms.length === 1) {
        await cli.buildUsingDocker(
            newImage,
            context,
            containerFileAbsPaths,
            buildArgs,
            useOCI,
            labels,
            annotations,
            layers,
            extraArgs,
            tlsVerify,
            archs[0],
            platforms[0]
        );
        builtImage.push(newImage);
    }
    else {
        await cli.buildUsingDocker(
            newImage,
            context,
            containerFileAbsPaths,
            buildArgs,
            useOCI,
            labels,
            annotations,
            layers,
            extraArgs,
            tlsVerify
        );
        builtImage.push(newImage);
    }

    return builtImage;
}

async function doBuildFromScratch(
    cli: BuildahCli,
    newImage: string,
    useOCI: boolean,
    archs: string[],
    labels: string[],
    extraArgs: string[]
): Promise<string[]> {
    core.info(`Performing build from scratch`);

    const baseImage = core.getInput(Inputs.BASE_IMAGE, { required: true });
    const content = getInputList(Inputs.CONTENT);
    const entrypoint = getInputList(Inputs.ENTRYPOINT);
    const ports = getInputList(Inputs.PORT);
    const workingDir = core.getInput(Inputs.WORKDIR);
    const envs = getInputList(Inputs.ENVS);
    const squash = core.getInput(Inputs.SQUASH) === "true";
    const tlsVerify = core.getInput(Inputs.TLS_VERIFY) === "true";

    const container = await cli.from(baseImage, tlsVerify, extraArgs);
    const containerId = container.output.replace("\n", "");

    const builtImage = [];
    if (archs.length > 0) {
        for (const arch of archs) {
            let tagSuffix = "";
            if (archs.length > 1) {
                tagSuffix = `-${removeIllegalCharacters(arch)}`;
            }
            const newImageConfig: BuildahConfigSettings = {
                entrypoint,
                ports,
                workingdir: workingDir,
                envs,
                arch,
                labels,
            };
            await cli.config(containerId, newImageConfig);
            await cli.copy(containerId, content);
            await cli.commit(containerId, `${newImage}${tagSuffix}`, useOCI, squash);
            builtImage.push(`${newImage}${tagSuffix}`);
        }
    }
    else {
        const newImageConfig: BuildahConfigSettings = {
            entrypoint,
            ports,
            workingdir: workingDir,
            envs,
            labels,
        };
        await cli.config(containerId, newImageConfig);
        await cli.copy(containerId, content);
        await cli.commit(containerId, newImage, useOCI, squash);
        builtImage.push(newImage);
    }

    return builtImage;
}

run().catch(core.setFailed);
