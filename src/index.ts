import * as core from '@actions/core';
import * as io from '@actions/io';
import { BuildahCli, BuildahConfigSettings } from './buildah';

/**
 * 1. Buildah only works on Linux as the docker action
 * 2. Does this action also need to setup buildah? 
 * 3. Does this action also have the ability to push to a registry?
 * 
 */
export async function run(): Promise<void> {
    const baseImage = core.getInput('base-image');
    const content = core.getInput('content');
    const entrypoint = await getInputList('entrypoint');
    const port = core.getInput('port');
    const newImageName = core.getInput('new-image-name');
    const runnerOS = process.env.RUNNER_OS;

    if (runnerOS !== 'linux') {
        throw new Error(`Only supported on linux platform`);
    }
    // get buildah cli
    const buildahPath = await io.which('buildah', true);    

    // create image
    const cli: BuildahCli = new BuildahCli(buildahPath);
    const creationResult = await cli.from(baseImage);
    if (creationResult.succeeded === false) {
        return Promise.reject(new Error(creationResult.reason));
    }
    const containerId = creationResult.output;

    const copyResult = await cli.copy(containerId, content);
    if (copyResult.succeeded === false) {
        return Promise.reject(new Error(copyResult.reason));
    }

    const configuration: BuildahConfigSettings = {
        entrypoint: entrypoint,
        port: port
    }
    const configResult = await cli.config(containerId, configuration);
    if (configResult.succeeded === false) {
        return Promise.reject(new Error(configResult.reason));
    }

    const commit = await cli.commit(containerId, newImageName, ['--squash']);
    if (commit.succeeded === false) {
        return Promise.reject(new Error(commit.reason));
    }

    core.setOutput('image', newImageName);
}

export async function getInputList(name: string, ignoreComma?: boolean): Promise<string[]> {
    const items = core.getInput(name);
    if (items == '') {
      return [];
    }
    return items
      .split(/\r?\n/)
      .filter(x => x)
      .reduce<string[]>(
        (acc, line) => acc.concat(!ignoreComma ? line.split(',').filter(x => x) : line).map(pat => pat.trim()),
        []
      );
  }

run().catch(core.setFailed);