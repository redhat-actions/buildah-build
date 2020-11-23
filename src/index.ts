import * as core from '@actions/core';
import * as io from '@actions/io';
import { BuildahCli, BuildahConfigSettings } from './buildah';
import * as recognizer from 'language-recognizer';
import {promises as fs} from 'fs';
import * as path from 'path';
import { Language } from 'language-recognizer/lib/types';

export async function run(): Promise<void> {

    if (process.env.RUNNER_OS !== 'Linux') {
        return Promise.reject(new Error('Only linux platform is supported at this time.'));
    }

    // get buildah cli
    const buildahPath = await io.which('buildah', true);
    const cli: BuildahCli = new BuildahCli(buildahPath);

    const workspace = process.env['GITHUB_WORKSPACE'];
    let dockerFiles = getInputList('dockerfiles');
    const newImage = `${core.getInput('image', { required: true })}:${core.getInput('tag', { required: true })}`;

    if (dockerFiles.length !== 0) {
        doBuildUsingDockerFiles(cli, newImage, workspace, dockerFiles);
    } else {
        doBuildFromScratch(cli, newImage, workspace);
    }
}

async function doBuildUsingDockerFiles(cli: BuildahCli, newImage: string, workspace: string, dockerFiles: string[]): Promise<void> {
    const context = path.join(workspace, core.getInput('context'));
    const buildArgs = getInputList(core.getInput('build-args'));
    dockerFiles = dockerFiles.map(file => path.join(workspace, file));
    const build = await cli.buildUsingDocker(newImage, context, dockerFiles, buildArgs);
    if (build.succeeded === false) {
        return Promise.reject(new Error('Failed building an image from docker files.'));
    }
}

async function doBuildFromScratch(cli: BuildahCli, newImage: string, workspace: string) {
    let baseImage = core.getInput('base-image');
    const content = getInputList('content');
    const entrypoint = getInputList('entrypoint');
    const port = core.getInput('port');
    const workingDir = core.getInput('workdir');
    const envs = getInputList('envs');

    // if base-image is not specified by the user we need to pick one automatically
    if (!baseImage) {
        if (workspace) {
            // check language/framework used and pick base-image automatically
            const languages = await recognizer.detectLanguages(workspace);
            baseImage = await getSuggestedBaseImage(languages);
            if (!baseImage) {
                return Promise.reject(new Error('No base image found to create a new container'));
            }
        } else {
            return Promise.reject(new Error('No base image found to create a new container'));
        }
    }

    const container = await cli.from(baseImage);
    if (container.succeeded === false) {
        return Promise.reject(new Error(container.reason));
    }
    const containerId = container.output.replace('\n', '');

    const copyResult = await cli.copy(containerId, content);
    if (copyResult.succeeded === false) {
        return Promise.reject(new Error(copyResult.reason));
    }

    const newImageConfig: BuildahConfigSettings = {
        entrypoint: entrypoint,
        port: port,
        workingdir: workingDir,
        envs: envs
    };
    const configResult = await cli.config(containerId, newImageConfig);
    if (configResult.succeeded === false) {
        return Promise.reject(new Error(configResult.reason));
    }

    const commit = await cli.commit(containerId, newImage, ['--squash']);
    if (commit.succeeded === false) {
        return Promise.reject(new Error(commit.reason));
    }
}

function getInputList(name: string): string[] {
    const items = core.getInput(name);
    if (!items) {
      return [];
    }
    return items
      .split(/\r?\n/)
      .filter(x => x)
      .reduce<string[]>(
          (acc, line) => acc.concat(line).map(pat => pat.trim()),
          []
        );
}

async function getSuggestedBaseImage(languages: Language[]): Promise<string> {
    if (!languages || languages.length === 0) {
        return undefined;
    }

    for (const language of languages) {
        const baseImage = await getBaseImageByLanguage(language);
        if (baseImage) {
            return baseImage;
        }
    }

    return undefined;
}

async function getBaseImageByLanguage(language: Language): Promise<string> {
    // eslint-disable-next-line no-undef
    const rawData = await fs.readFile(path.join(__dirname, '..', 'language-image.json'), 'utf-8');
    const languageImageJSON = JSON.parse(rawData);
    return languageImageJSON[language.name];
}

run().catch(core.setFailed);
