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
exports.BuildahCli = void 0;
const exec = require("@actions/exec");
class BuildahCli {
    constructor(executable) {
        this.executable = executable;
    }
    from(baseImage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!baseImage) {
                // find correct baseImage based on language project
            }
            return yield this.execute(['from', baseImage]);
        });
    }
    copy(container, content, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = ["copy", container, content];
            if (path) {
                args.push(path);
            }
            return yield this.execute(args);
        });
    }
    config(container, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = ['config'];
            if (settings.entrypoint) {
                args.push('--entrypoint');
                args.push(...settings.entrypoint);
            }
            if (settings.port) {
                args.push('--port');
                args.push(...settings.port);
            }
            args.push(container);
            return yield this.execute(args);
        });
    }
    commit(container, newImageName, flags = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = ["commit", ...flags, container, newImageName];
            return yield this.execute(args);
        });
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.executable) {
                return Promise.reject(new Error('Unable to call buildah executable'));
            }
            let output = '';
            let error = '';
            const options = {
                listeners: {
                    stdout: (data) => {
                        output += data.toString();
                    },
                    stderr: (data) => {
                        error += data.toString();
                    }
                }
            };
            yield exec.exec(`${this.executable}`, args, options);
            if (error) {
                return Promise.resolve({ succeeded: false, error: error });
            }
            return Promise.resolve({ succeeded: true, output: output });
        });
    }
}
exports.BuildahCli = BuildahCli;
