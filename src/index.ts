import * as core from "@actions/core";
import * as io from "@actions/io";
import * as path from "path";
import { BuildahCli, BuildahConfigSettings } from "./buildah";

export async function run(): Promise<void> {
    if (process.env.RUNNER_OS !== "Linux") {
        throw new Error("buildah, and therefore this action, only works on Linux. Please use a Linux runner.");
    }

    // get buildah cli
    const buildahPath = await io.which("buildah", true);
    const cli: BuildahCli = new BuildahCli(buildahPath);

    const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
    const dockerFiles = getInputList("dockerfiles");
    const image = core.getInput("image", { required: true });
    const tags = core.getInput("tags") || "latest";
    const tagsList: string[] = tags.split(" ");
    const newImage = `${image}:${tagsList[0]}`;
    const useOCI = core.getInput("oci") === "true";

    if (dockerFiles.length !== 0) {
        await doBuildUsingDockerFiles(cli, newImage, workspace, dockerFiles, useOCI);
    }
    else {
        await doBuildFromScratch(cli, newImage, useOCI);
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
    const dockerFileAbsPaths = dockerFiles.map((file) => path.join(workspace, file));
    await cli.buildUsingDocker(newImage, context, dockerFileAbsPaths, buildArgs, useOCI);
}

async function doBuildFromScratch(
    cli: BuildahCli, newImage: string, useOCI: boolean,
): Promise<void> {
    core.info(`Performing build from scratch`);

    const baseImage = core.getInput("base-image", { required: true });
    const content = getInputList("content");
    const entrypoint = getInputList("entrypoint");
    const port = core.getInput("port");
    const workingDir = core.getInput("workdir");
    const envs = getInputList("envs");

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

run().catch(core.setFailed);
