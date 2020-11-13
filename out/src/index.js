"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core = require("@actions/core");
const io = require("@actions/io");
const buildah_1 = require("./buildah");
const recognizer = require("language-recognizer");
const fs_1 = require("fs");
const path = require("path");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let baseImage = core.getInput('base-image');
        const content = getInputList('content');
        const newImageName = core.getInput('new-image-name');
        const entrypoint = getInputList('entrypoint');
        const port = core.getInput('port');
        const workingDir = core.getInput('working-dir');
        const envs = getInputList('envs');
        if (process.env.RUNNER_OS !== 'Linux') {
            return Promise.reject(new Error('Only linux platform is supported at this time.'));
        }
        // get buildah cli
        const buildahPath = yield io.which('buildah', true);
        // if base-image is not specified by the user we need to pick one automatically 
        if (!baseImage) {
            const workspace = process.env['GITHUB_WORKSPACE'];
            if (workspace) {
                // check language/framework used and pick base-image automatically
                const languages = yield recognizer.detectLanguages(workspace);
                baseImage = yield getSuggestedBaseImage(languages);
                if (!baseImage) {
                    return Promise.reject(new Error('No base image found to create a new container'));
                }
            }
            else {
                return Promise.reject(new Error('No base image found to create a new container'));
            }
        }
        // create the new image
        const cli = new buildah_1.BuildahCli(buildahPath);
        const container = yield cli.from(baseImage);
        if (container.succeeded === false) {
            return Promise.reject(new Error(container.reason));
        }
        const containerId = container.output.replace('\n', '');
        const copyResult = yield cli.copy(containerId, content);
        if (copyResult.succeeded === false) {
            return Promise.reject(new Error(copyResult.reason));
        }
        const newImageConfig = {
            entrypoint: entrypoint,
            port: port,
            workingdir: workingDir,
            envs: envs
        };
        const configResult = yield cli.config(containerId, newImageConfig);
        if (configResult.succeeded === false) {
            return Promise.reject(new Error(configResult.reason));
        }
        const commit = yield cli.commit(containerId, newImageName, ['--squash']);
        if (commit.succeeded === false) {
            return Promise.reject(new Error(commit.reason));
        }
    });
}
exports.run = run;
function getInputList(name) {
    const items = core.getInput(name);
    if (!items) {
        return [];
    }
    return items
        .split(/\r?\n/)
        .filter(x => x)
        .reduce((acc, line) => acc.concat(line).map(pat => pat.trim()), []);
}
function getSuggestedBaseImage(languages) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!languages || languages.length === 0) {
            return undefined;
        }
        for (const language of languages) {
            const baseImage = yield getBaseImageByLanguage(language);
            if (baseImage) {
                return baseImage;
            }
        }
        return undefined;
    });
}
function getBaseImageByLanguage(language) {
    return __awaiter(this, void 0, void 0, function* () {
        // eslint-disable-next-line no-undef
        const rawData = yield fs_1.promises.readFile(path.join(__dirname, '..', 'language-image.json'), 'utf-8');
        const languageImageJSON = JSON.parse(rawData);
        return languageImageJSON[language.name];
    });
}
run().catch(core.setFailed);
