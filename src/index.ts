import * as core from "@actions/core";
import * as io from "@actions/io";
import * as recognizer from "language-recognizer";
import { promises as fs } from "fs";
import * as path from "path";
import { Language } from "language-recognizer/lib/types";
import { BuildahCli, BuildahConfigSettings } from "./buildah";

export async function run(): Promise<void> {
    if (process.env.RUNNER_OS !== "Linux") {
        throw new Error("buildah, and therefore this action, only works on Linux. Please use a Linux runner.");
    }

    // get buildah cli
    const buildahPath = await io.which("buildah", true);
    const cli: BuildahCli = new BuildahCli(buildahPath);

    const workspace = process.env.GITHUB_WORKSPACE || "";
    const dockerFiles = getInputList("dockerfiles");
    const image = core.getInput("image", { required: true });
    const tags = core.getInput("tags");
    const tagsList: string[] = tags.split(" ");
    const newImage = `${image}:${tagsList[0]}`;
    const useOCI = core.getInput("oci") === "true";

    if (dockerFiles.length !== 0) {
        await doBuildUsingDockerFiles(cli, newImage, workspace, dockerFiles, useOCI);
    }
    else {
        await doBuildFromScratch(cli, newImage, workspace, useOCI);
    }

    if (tagsList.length > 1) {
        await cli.tag(image, tagsList);
    }
    core.setOutput("image", image);
    core.setOutput("tags", tags);
}

async function doBuildUsingDockerFiles(
    cli: BuildahCli, newImage: string, workspace: string, dockerFiles: string[], useOCI: boolean,
): Promise<void> {
    if (dockerFiles.length === 1) {
        core.info(`Performing build from Dockerfile`);
    }
    else {
        core.info(`Performing build from ${dockerFiles.length} Dockerfiles`);
    }

    const context = path.join(workspace, core.getInput("context"));
    const buildArgs = getInputList("build-args");
    const inputdockerFiles = dockerFiles.map((file) => path.join(workspace, file));
    await cli.buildUsingDocker(newImage, context, inputdockerFiles, buildArgs, useOCI);
}

async function doBuildFromScratch(
    cli: BuildahCli, newImage: string, workspace: string, useOCI: boolean,
): Promise<void> {
    core.info(`Performing build from scratch`);

    let baseImage = core.getInput("base-image");
    const content = getInputList("content");
    const entrypoint = getInputList("entrypoint");
    const port = core.getInput("port");
    const workingDir = core.getInput("workdir");
    const envs = getInputList("envs");

    // if base-image is not specified by the user we need to pick one automatically
    if (!baseImage) {
        if (workspace) {
            // check language/framework used and pick base-image automatically
            const languages = await recognizer.detectLanguages(workspace);
            baseImage = await getSuggestedBaseImage(languages);
            if (!baseImage) {
                throw new Error("No base image found to create a new container");
            }
        }
        else {
            throw new Error("No base image found to create a new container");
        }
    }

    const container = await cli.from(baseImage);
    const containerId = container.output.replace("\n", "");

    await cli.copy(containerId, content);

    const newImageConfig: BuildahConfigSettings = {
        entrypoint,
        port,
        workingdir: workingDir,
        envs,
    };
    await cli.config(containerId, newImageConfig);
    await cli.commit(containerId, newImage, useOCI);
}

function getInputList(name: string): string[] {
    const items = core.getInput(name);
    if (!items) {
        return [];
    }
    return items
        .split(/\r?\n/)
        .filter((x) => x)
        .reduce<string[]>(
            (acc, line) => acc.concat(line).map((pat) => pat.trim()),
            [],
        );
}

async function getSuggestedBaseImage(languages: Language[]): Promise<string> {
    let baseImage = "";
    for (const language of languages) {
        baseImage = await getBaseImageByLanguage(language);
        if (baseImage) {
            return baseImage;
        }
    }

    return baseImage;
}

async function getBaseImageByLanguage(language: Language): Promise<string> {
    const rawData = await fs.readFile(path.join(__dirname, "..", "language-image.json"), "utf-8");
    const languageImageJSON = JSON.parse(rawData);
    return languageImageJSON[language.name];
}

run().catch(core.setFailed);
