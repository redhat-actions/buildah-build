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
exports.getInputList = exports.run = void 0;
const core = require("@actions/core");
const io = require("@actions/io");
const buildah_1 = require("./buildah");
/**
 * 1. Buildah only works on Linux as the docker action
 * 2. Does this action also need to setup buildah?
 * 3. Does this action also have the ability to push to a registry?
 *
 */
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const baseImage = core.getInput('base-image');
        const content = core.getInput('content');
        const entrypoint = yield getInputList('entrypoint');
        const port = core.getInput('port');
        const newImageName = core.getInput('new-image-name');
        const runnerOS = process.env.RUNNER_OS;
        if (runnerOS !== 'Linux') {
            throw new Error(`Only supported on linux platform`);
        }
        // get buildah cli
        const buildahPath = yield io.which('buildah', true);
        // create image
        const cli = new buildah_1.BuildahCli(buildahPath);
        const creationResult = yield cli.from(baseImage);
        if (creationResult.succeeded === false) {
            return Promise.reject(new Error(creationResult.reason));
        }
        const containerId = creationResult.output;
        const copyResult = yield cli.copy(containerId, content);
        if (copyResult.succeeded === false) {
            return Promise.reject(new Error(copyResult.reason));
        }
        const configuration = {
            entrypoint: entrypoint,
            port: port
        };
        const configResult = yield cli.config(containerId, configuration);
        if (configResult.succeeded === false) {
            return Promise.reject(new Error(configResult.reason));
        }
        const commit = yield cli.commit(containerId, newImageName, ['--squash']);
        if (commit.succeeded === false) {
            return Promise.reject(new Error(commit.reason));
        }
        core.setOutput('image', newImageName);
    });
}
exports.run = run;
function getInputList(name, ignoreComma) {
    return __awaiter(this, void 0, void 0, function* () {
        const items = core.getInput(name);
        if (items == '') {
            return [];
        }
        return items
            .split(/\r?\n/)
            .filter(x => x)
            .reduce((acc, line) => acc.concat(!ignoreComma ? line.split(',').filter(x => x) : line).map(pat => pat.trim()), []);
    });
}
exports.getInputList = getInputList;
run().catch(core.setFailed);
