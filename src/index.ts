import * as core from "@actions/core";
import * as io from "@actions/io";
import * as path from "path";
import { Inputs, Outputs } from "./generated/inputs-outputs";
import { BuildahCli, BuildahConfigSettings } from "./buildah";

export async function run(): Promise<void> {
    if (process.env.RUNNER_OS !== "Linux") {
        throw new Error("buildah, and therefore this action, only works on Linux. Please use a Linux runner.");
    }

    // get buildah cli
    const buildahPath = await io.which("buildah", true);
    const cli: BuildahCli = new BuildahCli(buildahPath);

    // print buildah version
    await cli.execute([ "version" ]);

    const DEFAULT_TAG = "latest";
    const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
    const dockerFiles = getInputList(Inputs.DOCKERFILES);
    const image = core.getInput(Inputs.IMAGE, { required: true });
    const tags = core.getInput(Inputs.TAGS);
    const tagsList: string[] = tags.split(" ");

    // info message if user doesn't provides any tag
    if (!tagsList.length) {
        core.info(`Input "${Inputs.TAGS}" is not provided, using default tag "${DEFAULT_TAG}"`);
        tagsList.push(DEFAULT_TAG);
    }
    const newImage = `${image}:${tagsList[0]}`;
    const useOCI = core.getInput(Inputs.OCI) === "true";
    let archs: string | undefined = core.getInput(Inputs.ARCHS);
    // remove white spaces (if any) in archs input
    archs = archs.replace(/\s+/g, "");

    if (dockerFiles.length !== 0) {
        await doBuildUsingDockerFiles(cli, newImage, workspace, dockerFiles, useOCI, archs);
    }
    else {
        await doBuildFromScratch(cli, newImage, useOCI, archs);
    }

    if (tagsList.length > 1) {
        await cli.tag(image, tagsList);
    }
    core.setOutput(Outputs.IMAGE, image);
    core.setOutput(Outputs.TAGS, tags);
}

async function doBuildUsingDockerFiles(
    cli: BuildahCli, newImage: string, workspace: string, dockerFiles: string[], useOCI: boolean, archs: string
): Promise<void> {
    if (dockerFiles.length === 1) {
        core.info(`Performing build from Dockerfile`);
    }
    else {
        core.info(`Performing build from ${dockerFiles.length} Dockerfiles`);
    }

    const context = path.join(workspace, core.getInput(Inputs.CONTEXT));
    const buildArgs = getInputList(Inputs.BUILD_ARGS);
    const dockerFileAbsPaths = dockerFiles.map((file) => path.join(workspace, file));
    const layers = core.getInput(Inputs.LAYERS);
    await cli.buildUsingDocker(newImage, context, dockerFileAbsPaths, buildArgs, useOCI, archs, layers);
}

async function doBuildFromScratch(
    cli: BuildahCli, newImage: string, useOCI: boolean, archs: string
): Promise<void> {
    core.info(`Performing build from scratch`);

    const baseImage = core.getInput(Inputs.BASE_IMAGE, { required: true });
    const content = getInputList(Inputs.CONTENT);
    const entrypoint = getInputList(Inputs.ENTRYPOINT);
    const port = core.getInput(Inputs.PORT);
    const workingDir = core.getInput(Inputs.WORKDIR);
    const envs = getInputList(Inputs.ENVS);

    const container = await cli.from(baseImage);
    const containerId = container.output.replace("\n", "");

    await cli.copy(containerId, content);

    const newImageConfig: BuildahConfigSettings = {
        entrypoint,
        port,
        workingdir: workingDir,
        envs,
        archs,
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
