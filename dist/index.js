require('./sourcemap-register.js');module.exports=(()=>{var e={351:function(e,t,n){"use strict";var s=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(e!=null)for(var n in e)if(Object.hasOwnProperty.call(e,n))t[n]=e[n];t["default"]=e;return t};Object.defineProperty(t,"__esModule",{value:true});const i=s(n(87));const r=n(278);function issueCommand(e,t,n){const s=new Command(e,t,n);process.stdout.write(s.toString()+i.EOL)}t.issueCommand=issueCommand;function issue(e,t=""){issueCommand(e,{},t)}t.issue=issue;const o="::";class Command{constructor(e,t,n){if(!e){e="missing.command"}this.command=e;this.properties=t;this.message=n}toString(){let e=o+this.command;if(this.properties&&Object.keys(this.properties).length>0){e+=" ";let t=true;for(const n in this.properties){if(this.properties.hasOwnProperty(n)){const s=this.properties[n];if(s){if(t){t=false}else{e+=","}e+=`${n}=${escapeProperty(s)}`}}}}e+=`${o}${escapeData(this.message)}`;return e}}function escapeData(e){return r.toCommandValue(e).replace(/%/g,"%25").replace(/\r/g,"%0D").replace(/\n/g,"%0A")}function escapeProperty(e){return r.toCommandValue(e).replace(/%/g,"%25").replace(/\r/g,"%0D").replace(/\n/g,"%0A").replace(/:/g,"%3A").replace(/,/g,"%2C")}},186:function(e,t,n){"use strict";var s=this&&this.__awaiter||function(e,t,n,s){function adopt(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||(n=Promise))(function(n,i){function fulfilled(e){try{step(s.next(e))}catch(e){i(e)}}function rejected(e){try{step(s["throw"](e))}catch(e){i(e)}}function step(e){e.done?n(e.value):adopt(e.value).then(fulfilled,rejected)}step((s=s.apply(e,t||[])).next())})};var i=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(e!=null)for(var n in e)if(Object.hasOwnProperty.call(e,n))t[n]=e[n];t["default"]=e;return t};Object.defineProperty(t,"__esModule",{value:true});const r=n(351);const o=n(717);const u=n(278);const c=i(n(87));const l=i(n(622));var a;(function(e){e[e["Success"]=0]="Success";e[e["Failure"]=1]="Failure"})(a=t.ExitCode||(t.ExitCode={}));function exportVariable(e,t){const n=u.toCommandValue(t);process.env[e]=n;const s=process.env["GITHUB_ENV"]||"";if(s){const t="_GitHubActionsFileCommandDelimeter_";const s=`${e}<<${t}${c.EOL}${n}${c.EOL}${t}`;o.issueCommand("ENV",s)}else{r.issueCommand("set-env",{name:e},n)}}t.exportVariable=exportVariable;function setSecret(e){r.issueCommand("add-mask",{},e)}t.setSecret=setSecret;function addPath(e){const t=process.env["GITHUB_PATH"]||"";if(t){o.issueCommand("PATH",e)}else{r.issueCommand("add-path",{},e)}process.env["PATH"]=`${e}${l.delimiter}${process.env["PATH"]}`}t.addPath=addPath;function getInput(e,t){const n=process.env[`INPUT_${e.replace(/ /g,"_").toUpperCase()}`]||"";if(t&&t.required&&!n){throw new Error(`Input required and not supplied: ${e}`)}return n.trim()}t.getInput=getInput;function setOutput(e,t){r.issueCommand("set-output",{name:e},t)}t.setOutput=setOutput;function setCommandEcho(e){r.issue("echo",e?"on":"off")}t.setCommandEcho=setCommandEcho;function setFailed(e){process.exitCode=a.Failure;error(e)}t.setFailed=setFailed;function isDebug(){return process.env["RUNNER_DEBUG"]==="1"}t.isDebug=isDebug;function debug(e){r.issueCommand("debug",{},e)}t.debug=debug;function error(e){r.issue("error",e instanceof Error?e.toString():e)}t.error=error;function warning(e){r.issue("warning",e instanceof Error?e.toString():e)}t.warning=warning;function info(e){process.stdout.write(e+c.EOL)}t.info=info;function startGroup(e){r.issue("group",e)}t.startGroup=startGroup;function endGroup(){r.issue("endgroup")}t.endGroup=endGroup;function group(e,t){return s(this,void 0,void 0,function*(){startGroup(e);let n;try{n=yield t()}finally{endGroup()}return n})}t.group=group;function saveState(e,t){r.issueCommand("save-state",{name:e},t)}t.saveState=saveState;function getState(e){return process.env[`STATE_${e}`]||""}t.getState=getState},717:function(e,t,n){"use strict";var s=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(e!=null)for(var n in e)if(Object.hasOwnProperty.call(e,n))t[n]=e[n];t["default"]=e;return t};Object.defineProperty(t,"__esModule",{value:true});const i=s(n(747));const r=s(n(87));const o=n(278);function issueCommand(e,t){const n=process.env[`GITHUB_${e}`];if(!n){throw new Error(`Unable to find environment variable for file command ${e}`)}if(!i.existsSync(n)){throw new Error(`Missing file at path: ${n}`)}i.appendFileSync(n,`${o.toCommandValue(t)}${r.EOL}`,{encoding:"utf8"})}t.issueCommand=issueCommand},278:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:true});function toCommandValue(e){if(e===null||e===undefined){return""}else if(typeof e==="string"||e instanceof String){return e}return JSON.stringify(e)}t.toCommandValue=toCommandValue},514:function(e,t,n){"use strict";var s=this&&this.__awaiter||function(e,t,n,s){function adopt(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||(n=Promise))(function(n,i){function fulfilled(e){try{step(s.next(e))}catch(e){i(e)}}function rejected(e){try{step(s["throw"](e))}catch(e){i(e)}}function step(e){e.done?n(e.value):adopt(e.value).then(fulfilled,rejected)}step((s=s.apply(e,t||[])).next())})};var i=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(e!=null)for(var n in e)if(Object.hasOwnProperty.call(e,n))t[n]=e[n];t["default"]=e;return t};Object.defineProperty(t,"__esModule",{value:true});const r=i(n(159));function exec(e,t,n){return s(this,void 0,void 0,function*(){const s=r.argStringToArray(e);if(s.length===0){throw new Error(`Parameter 'commandLine' cannot be null or empty.`)}const i=s[0];t=s.slice(1).concat(t||[]);const o=new r.ToolRunner(i,t,n);return o.exec()})}t.exec=exec},159:function(e,t,n){"use strict";var s=this&&this.__awaiter||function(e,t,n,s){function adopt(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||(n=Promise))(function(n,i){function fulfilled(e){try{step(s.next(e))}catch(e){i(e)}}function rejected(e){try{step(s["throw"](e))}catch(e){i(e)}}function step(e){e.done?n(e.value):adopt(e.value).then(fulfilled,rejected)}step((s=s.apply(e,t||[])).next())})};var i=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(e!=null)for(var n in e)if(Object.hasOwnProperty.call(e,n))t[n]=e[n];t["default"]=e;return t};Object.defineProperty(t,"__esModule",{value:true});const r=i(n(87));const o=i(n(614));const u=i(n(129));const c=i(n(622));const l=i(n(436));const a=i(n(962));const f=process.platform==="win32";class ToolRunner extends o.EventEmitter{constructor(e,t,n){super();if(!e){throw new Error("Parameter 'toolPath' cannot be null or empty.")}this.toolPath=e;this.args=t||[];this.options=n||{}}_debug(e){if(this.options.listeners&&this.options.listeners.debug){this.options.listeners.debug(e)}}_getCommandString(e,t){const n=this._getSpawnFileName();const s=this._getSpawnArgs(e);let i=t?"":"[command]";if(f){if(this._isCmdFile()){i+=n;for(const e of s){i+=` ${e}`}}else if(e.windowsVerbatimArguments){i+=`"${n}"`;for(const e of s){i+=` ${e}`}}else{i+=this._windowsQuoteCmdArg(n);for(const e of s){i+=` ${this._windowsQuoteCmdArg(e)}`}}}else{i+=n;for(const e of s){i+=` ${e}`}}return i}_processLineBuffer(e,t,n){try{let s=t+e.toString();let i=s.indexOf(r.EOL);while(i>-1){const e=s.substring(0,i);n(e);s=s.substring(i+r.EOL.length);i=s.indexOf(r.EOL)}t=s}catch(e){this._debug(`error processing line. Failed with error ${e}`)}}_getSpawnFileName(){if(f){if(this._isCmdFile()){return process.env["COMSPEC"]||"cmd.exe"}}return this.toolPath}_getSpawnArgs(e){if(f){if(this._isCmdFile()){let t=`/D /S /C "${this._windowsQuoteCmdArg(this.toolPath)}`;for(const n of this.args){t+=" ";t+=e.windowsVerbatimArguments?n:this._windowsQuoteCmdArg(n)}t+='"';return[t]}}return this.args}_endsWith(e,t){return e.endsWith(t)}_isCmdFile(){const e=this.toolPath.toUpperCase();return this._endsWith(e,".CMD")||this._endsWith(e,".BAT")}_windowsQuoteCmdArg(e){if(!this._isCmdFile()){return this._uvQuoteCmdArg(e)}if(!e){return'""'}const t=[" ","\t","&","(",")","[","]","{","}","^","=",";","!","'","+",",","`","~","|","<",">",'"'];let n=false;for(const s of e){if(t.some(e=>e===s)){n=true;break}}if(!n){return e}let s='"';let i=true;for(let t=e.length;t>0;t--){s+=e[t-1];if(i&&e[t-1]==="\\"){s+="\\"}else if(e[t-1]==='"'){i=true;s+='"'}else{i=false}}s+='"';return s.split("").reverse().join("")}_uvQuoteCmdArg(e){if(!e){return'""'}if(!e.includes(" ")&&!e.includes("\t")&&!e.includes('"')){return e}if(!e.includes('"')&&!e.includes("\\")){return`"${e}"`}let t='"';let n=true;for(let s=e.length;s>0;s--){t+=e[s-1];if(n&&e[s-1]==="\\"){t+="\\"}else if(e[s-1]==='"'){n=true;t+="\\"}else{n=false}}t+='"';return t.split("").reverse().join("")}_cloneExecOptions(e){e=e||{};const t={cwd:e.cwd||process.cwd(),env:e.env||process.env,silent:e.silent||false,windowsVerbatimArguments:e.windowsVerbatimArguments||false,failOnStdErr:e.failOnStdErr||false,ignoreReturnCode:e.ignoreReturnCode||false,delay:e.delay||1e4};t.outStream=e.outStream||process.stdout;t.errStream=e.errStream||process.stderr;return t}_getSpawnOptions(e,t){e=e||{};const n={};n.cwd=e.cwd;n.env=e.env;n["windowsVerbatimArguments"]=e.windowsVerbatimArguments||this._isCmdFile();if(e.windowsVerbatimArguments){n.argv0=`"${t}"`}return n}exec(){return s(this,void 0,void 0,function*(){if(!a.isRooted(this.toolPath)&&(this.toolPath.includes("/")||f&&this.toolPath.includes("\\"))){this.toolPath=c.resolve(process.cwd(),this.options.cwd||process.cwd(),this.toolPath)}this.toolPath=yield l.which(this.toolPath,true);return new Promise((e,t)=>{this._debug(`exec tool: ${this.toolPath}`);this._debug("arguments:");for(const e of this.args){this._debug(`   ${e}`)}const n=this._cloneExecOptions(this.options);if(!n.silent&&n.outStream){n.outStream.write(this._getCommandString(n)+r.EOL)}const s=new ExecState(n,this.toolPath);s.on("debug",e=>{this._debug(e)});const i=this._getSpawnFileName();const o=u.spawn(i,this._getSpawnArgs(n),this._getSpawnOptions(this.options,i));const c="";if(o.stdout){o.stdout.on("data",e=>{if(this.options.listeners&&this.options.listeners.stdout){this.options.listeners.stdout(e)}if(!n.silent&&n.outStream){n.outStream.write(e)}this._processLineBuffer(e,c,e=>{if(this.options.listeners&&this.options.listeners.stdline){this.options.listeners.stdline(e)}})})}const l="";if(o.stderr){o.stderr.on("data",e=>{s.processStderr=true;if(this.options.listeners&&this.options.listeners.stderr){this.options.listeners.stderr(e)}if(!n.silent&&n.errStream&&n.outStream){const t=n.failOnStdErr?n.errStream:n.outStream;t.write(e)}this._processLineBuffer(e,l,e=>{if(this.options.listeners&&this.options.listeners.errline){this.options.listeners.errline(e)}})})}o.on("error",e=>{s.processError=e.message;s.processExited=true;s.processClosed=true;s.CheckComplete()});o.on("exit",e=>{s.processExitCode=e;s.processExited=true;this._debug(`Exit code ${e} received from tool '${this.toolPath}'`);s.CheckComplete()});o.on("close",e=>{s.processExitCode=e;s.processExited=true;s.processClosed=true;this._debug(`STDIO streams have closed for tool '${this.toolPath}'`);s.CheckComplete()});s.on("done",(n,s)=>{if(c.length>0){this.emit("stdline",c)}if(l.length>0){this.emit("errline",l)}o.removeAllListeners();if(n){t(n)}else{e(s)}});if(this.options.input){if(!o.stdin){throw new Error("child process missing stdin")}o.stdin.end(this.options.input)}})})}}t.ToolRunner=ToolRunner;function argStringToArray(e){const t=[];let n=false;let s=false;let i="";function append(e){if(s&&e!=='"'){i+="\\"}i+=e;s=false}for(let r=0;r<e.length;r++){const o=e.charAt(r);if(o==='"'){if(!s){n=!n}else{append(o)}continue}if(o==="\\"&&s){append(o);continue}if(o==="\\"&&n){s=true;continue}if(o===" "&&!n){if(i.length>0){t.push(i);i=""}continue}append(o)}if(i.length>0){t.push(i.trim())}return t}t.argStringToArray=argStringToArray;class ExecState extends o.EventEmitter{constructor(e,t){super();this.processClosed=false;this.processError="";this.processExitCode=0;this.processExited=false;this.processStderr=false;this.delay=1e4;this.done=false;this.timeout=null;if(!t){throw new Error("toolPath must not be empty")}this.options=e;this.toolPath=t;if(e.delay){this.delay=e.delay}}CheckComplete(){if(this.done){return}if(this.processClosed){this._setResult()}else if(this.processExited){this.timeout=setTimeout(ExecState.HandleTimeout,this.delay,this)}}_debug(e){this.emit("debug",e)}_setResult(){let e;if(this.processExited){if(this.processError){e=new Error(`There was an error when attempting to execute the process '${this.toolPath}'. This may indicate the process failed to start. Error: ${this.processError}`)}else if(this.processExitCode!==0&&!this.options.ignoreReturnCode){e=new Error(`The process '${this.toolPath}' failed with exit code ${this.processExitCode}`)}else if(this.processStderr&&this.options.failOnStdErr){e=new Error(`The process '${this.toolPath}' failed because one or more lines were written to the STDERR stream`)}}if(this.timeout){clearTimeout(this.timeout);this.timeout=null}this.done=true;this.emit("done",e,this.processExitCode)}static HandleTimeout(e){if(e.done){return}if(!e.processClosed&&e.processExited){const t=`The STDIO streams did not close within ${e.delay/1e3} seconds of the exit event from process '${e.toolPath}'. This may indicate a child process inherited the STDIO streams and has not yet exited.`;e._debug(t)}e._setResult()}}},962:function(e,t,n){"use strict";var s=this&&this.__awaiter||function(e,t,n,s){function adopt(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||(n=Promise))(function(n,i){function fulfilled(e){try{step(s.next(e))}catch(e){i(e)}}function rejected(e){try{step(s["throw"](e))}catch(e){i(e)}}function step(e){e.done?n(e.value):adopt(e.value).then(fulfilled,rejected)}step((s=s.apply(e,t||[])).next())})};var i;Object.defineProperty(t,"__esModule",{value:true});const r=n(357);const o=n(747);const u=n(622);i=o.promises,t.chmod=i.chmod,t.copyFile=i.copyFile,t.lstat=i.lstat,t.mkdir=i.mkdir,t.readdir=i.readdir,t.readlink=i.readlink,t.rename=i.rename,t.rmdir=i.rmdir,t.stat=i.stat,t.symlink=i.symlink,t.unlink=i.unlink;t.IS_WINDOWS=process.platform==="win32";function exists(e){return s(this,void 0,void 0,function*(){try{yield t.stat(e)}catch(e){if(e.code==="ENOENT"){return false}throw e}return true})}t.exists=exists;function isDirectory(e,n=false){return s(this,void 0,void 0,function*(){const s=n?yield t.stat(e):yield t.lstat(e);return s.isDirectory()})}t.isDirectory=isDirectory;function isRooted(e){e=normalizeSeparators(e);if(!e){throw new Error('isRooted() parameter "p" cannot be empty')}if(t.IS_WINDOWS){return e.startsWith("\\")||/^[A-Z]:/i.test(e)}return e.startsWith("/")}t.isRooted=isRooted;function mkdirP(e,n=1e3,i=1){return s(this,void 0,void 0,function*(){r.ok(e,"a path argument must be provided");e=u.resolve(e);if(i>=n)return t.mkdir(e);try{yield t.mkdir(e);return}catch(s){switch(s.code){case"ENOENT":{yield mkdirP(u.dirname(e),n,i+1);yield t.mkdir(e);return}default:{let n;try{n=yield t.stat(e)}catch(e){throw s}if(!n.isDirectory())throw s}}}})}t.mkdirP=mkdirP;function tryGetExecutablePath(e,n){return s(this,void 0,void 0,function*(){let s=undefined;try{s=yield t.stat(e)}catch(t){if(t.code!=="ENOENT"){console.log(`Unexpected error attempting to determine if executable file exists '${e}': ${t}`)}}if(s&&s.isFile()){if(t.IS_WINDOWS){const t=u.extname(e).toUpperCase();if(n.some(e=>e.toUpperCase()===t)){return e}}else{if(isUnixExecutable(s)){return e}}}const i=e;for(const r of n){e=i+r;s=undefined;try{s=yield t.stat(e)}catch(t){if(t.code!=="ENOENT"){console.log(`Unexpected error attempting to determine if executable file exists '${e}': ${t}`)}}if(s&&s.isFile()){if(t.IS_WINDOWS){try{const n=u.dirname(e);const s=u.basename(e).toUpperCase();for(const i of yield t.readdir(n)){if(s===i.toUpperCase()){e=u.join(n,i);break}}}catch(t){console.log(`Unexpected error attempting to determine the actual case of the file '${e}': ${t}`)}return e}else{if(isUnixExecutable(s)){return e}}}}return""})}t.tryGetExecutablePath=tryGetExecutablePath;function normalizeSeparators(e){e=e||"";if(t.IS_WINDOWS){e=e.replace(/\//g,"\\");return e.replace(/\\\\+/g,"\\")}return e.replace(/\/\/+/g,"/")}function isUnixExecutable(e){return(e.mode&1)>0||(e.mode&8)>0&&e.gid===process.getgid()||(e.mode&64)>0&&e.uid===process.getuid()}},436:function(e,t,n){"use strict";var s=this&&this.__awaiter||function(e,t,n,s){function adopt(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||(n=Promise))(function(n,i){function fulfilled(e){try{step(s.next(e))}catch(e){i(e)}}function rejected(e){try{step(s["throw"](e))}catch(e){i(e)}}function step(e){e.done?n(e.value):adopt(e.value).then(fulfilled,rejected)}step((s=s.apply(e,t||[])).next())})};Object.defineProperty(t,"__esModule",{value:true});const i=n(129);const r=n(622);const o=n(669);const u=n(962);const c=o.promisify(i.exec);function cp(e,t,n={}){return s(this,void 0,void 0,function*(){const{force:s,recursive:i}=readCopyOptions(n);const o=(yield u.exists(t))?yield u.stat(t):null;if(o&&o.isFile()&&!s){return}const c=o&&o.isDirectory()?r.join(t,r.basename(e)):t;if(!(yield u.exists(e))){throw new Error(`no such file or directory: ${e}`)}const l=yield u.stat(e);if(l.isDirectory()){if(!i){throw new Error(`Failed to copy. ${e} is a directory, but tried to copy without recursive flag.`)}else{yield cpDirRecursive(e,c,0,s)}}else{if(r.relative(e,c)===""){throw new Error(`'${c}' and '${e}' are the same file`)}yield copyFile(e,c,s)}})}t.cp=cp;function mv(e,t,n={}){return s(this,void 0,void 0,function*(){if(yield u.exists(t)){let s=true;if(yield u.isDirectory(t)){t=r.join(t,r.basename(e));s=yield u.exists(t)}if(s){if(n.force==null||n.force){yield rmRF(t)}else{throw new Error("Destination already exists")}}}yield mkdirP(r.dirname(t));yield u.rename(e,t)})}t.mv=mv;function rmRF(e){return s(this,void 0,void 0,function*(){if(u.IS_WINDOWS){try{if(yield u.isDirectory(e,true)){yield c(`rd /s /q "${e}"`)}else{yield c(`del /f /a "${e}"`)}}catch(e){if(e.code!=="ENOENT")throw e}try{yield u.unlink(e)}catch(e){if(e.code!=="ENOENT")throw e}}else{let t=false;try{t=yield u.isDirectory(e)}catch(e){if(e.code!=="ENOENT")throw e;return}if(t){yield c(`rm -rf "${e}"`)}else{yield u.unlink(e)}}})}t.rmRF=rmRF;function mkdirP(e){return s(this,void 0,void 0,function*(){yield u.mkdirP(e)})}t.mkdirP=mkdirP;function which(e,t){return s(this,void 0,void 0,function*(){if(!e){throw new Error("parameter 'tool' is required")}if(t){const t=yield which(e,false);if(!t){if(u.IS_WINDOWS){throw new Error(`Unable to locate executable file: ${e}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also verify the file has a valid extension for an executable file.`)}else{throw new Error(`Unable to locate executable file: ${e}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also check the file mode to verify the file is executable.`)}}}try{const t=[];if(u.IS_WINDOWS&&process.env.PATHEXT){for(const e of process.env.PATHEXT.split(r.delimiter)){if(e){t.push(e)}}}if(u.isRooted(e)){const n=yield u.tryGetExecutablePath(e,t);if(n){return n}return""}if(e.includes("/")||u.IS_WINDOWS&&e.includes("\\")){return""}const n=[];if(process.env.PATH){for(const e of process.env.PATH.split(r.delimiter)){if(e){n.push(e)}}}for(const s of n){const n=yield u.tryGetExecutablePath(s+r.sep+e,t);if(n){return n}}return""}catch(e){throw new Error(`which failed with message ${e.message}`)}})}t.which=which;function readCopyOptions(e){const t=e.force==null?true:e.force;const n=Boolean(e.recursive);return{force:t,recursive:n}}function cpDirRecursive(e,t,n,i){return s(this,void 0,void 0,function*(){if(n>=255)return;n++;yield mkdirP(t);const s=yield u.readdir(e);for(const r of s){const s=`${e}/${r}`;const o=`${t}/${r}`;const c=yield u.lstat(s);if(c.isDirectory()){yield cpDirRecursive(s,o,n,i)}else{yield copyFile(s,o,i)}}yield u.chmod(t,(yield u.stat(e)).mode)})}function copyFile(e,t,n){return s(this,void 0,void 0,function*(){if((yield u.lstat(e)).isSymbolicLink()){try{yield u.lstat(t);yield u.unlink(t)}catch(e){if(e.code==="EPERM"){yield u.chmod(t,"0666");yield u.unlink(t)}}const n=yield u.readlink(e);yield u.symlink(n,t,u.IS_WINDOWS?"junction":null)}else if(!(yield u.exists(t))||n){yield u.copyFile(e,t)}})}},885:e=>{const{hasOwnProperty:t}=Object.prototype;const n=typeof process!=="undefined"&&process.platform==="win32"?"\r\n":"\n";const s=(e,t)=>{const r=[];let o="";if(typeof t==="string"){t={section:t,whitespace:false}}else{t=t||Object.create(null);t.whitespace=t.whitespace===true}const c=t.whitespace?" = ":"=";for(const t of Object.keys(e)){const s=e[t];if(s&&Array.isArray(s)){for(const e of s)o+=u(t+"[]")+c+u(e)+"\n"}else if(s&&typeof s==="object")r.push(t);else o+=u(t)+c+u(s)+n}if(t.section&&o.length)o="["+u(t.section)+"]"+n+o;for(const u of r){const r=i(u).join("\\.");const c=(t.section?t.section+".":"")+r;const{whitespace:l}=t;const a=s(e[u],{section:c,whitespace:l});if(o.length&&a.length)o+=n;o+=a}return o};const i=e=>e.replace(/\1/g,"LITERAL\\1LITERAL").replace(/\\\./g,"").split(/\./).map(e=>e.replace(/\1/g,"\\.").replace(/\2LITERAL\\1LITERAL\2/g,""));const r=e=>{const n=Object.create(null);let s=n;let r=null;const o=/^\[([^\]]*)\]$|^([^=]+)(=(.*))?$/i;const u=e.split(/[\r\n]+/g);for(const e of u){if(!e||e.match(/^\s*[;#]/))continue;const i=e.match(o);if(!i)continue;if(i[1]!==undefined){r=c(i[1]);if(r==="__proto__"){s=Object.create(null);continue}s=n[r]=n[r]||Object.create(null);continue}const u=c(i[2]);const l=u.length>2&&u.slice(-2)==="[]";const a=l?u.slice(0,-2):u;if(a==="__proto__")continue;const f=i[3]?c(i[4]):true;const d=f==="true"||f==="false"||f==="null"?JSON.parse(f):f;if(l){if(!t.call(s,a))s[a]=[];else if(!Array.isArray(s[a]))s[a]=[s[a]]}if(Array.isArray(s[a]))s[a].push(d);else s[a]=d}const l=[];for(const e of Object.keys(n)){if(!t.call(n,e)||typeof n[e]!=="object"||Array.isArray(n[e]))continue;const s=i(e);let r=n;const o=s.pop();const u=o.replace(/\\\./g,".");for(const e of s){if(e==="__proto__")continue;if(!t.call(r,e)||typeof r[e]!=="object")r[e]=Object.create(null);r=r[e]}if(r===n&&u===o)continue;r[u]=n[e];l.push(e)}for(const e of l)delete n[e];return n};const o=e=>e.charAt(0)==='"'&&e.slice(-1)==='"'||e.charAt(0)==="'"&&e.slice(-1)==="'";const u=e=>typeof e!=="string"||e.match(/[=\r\n]/)||e.match(/^\[/)||e.length>1&&o(e)||e!==e.trim()?JSON.stringify(e):e.replace(/;/g,"\\;").replace(/#/g,"\\#");const c=(e,t)=>{e=(e||"").trim();if(o(e)){if(e.charAt(0)==="'")e=e.substr(1,e.length-2);try{e=JSON.parse(e)}catch(e){}}else{let t=false;let n="";for(let s=0,i=e.length;s<i;s++){const i=e.charAt(s);if(t){if("\\;#".indexOf(i)!==-1)n+=i;else n+="\\"+i;t=false}else if(";#".indexOf(i)!==-1)break;else if(i==="\\")t=true;else n+=i}if(t)n+="\\";return n.trim()}return e};e.exports={parse:r,decode:r,stringify:s,encode:s,safe:u,unsafe:c}},987:(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:true});t.BuildahCli=void 0;const s=n(186);const i=n(514);const r=n(622);const o=n(314);class BuildahCli{constructor(e){this.storageOptsEnv="";this.executable=e}async setStorageOptsEnv(){if(await o.isStorageDriverOverlay()){const e=await o.findFuseOverlayfsPath();if(e){s.info(`Overriding storage mount_program with "fuse-overlayfs" in environment`);this.storageOptsEnv=`overlay.mount_program=${e}`}else{s.warning(`"fuse-overlayfs" is not found. Install it before running this action. `+`For more detail see https://github.com/redhat-actions/buildah-build/issues/45`)}}else{s.info("Storage driver is not 'overlay', so not overriding storage configuration")}}static getImageFormatOption(e){return["--format",e?"oci":"docker"]}async buildUsingDocker(e,t,n,s,i,r,o,u,c,l){const a=["bud"];if(c){a.push("--arch");a.push(c)}if(l){a.push("--platform");a.push(l)}n.forEach(e=>{a.push("-f");a.push(e)});r.forEach(e=>{a.push("--label");a.push(e)});s.forEach(e=>{a.push("--build-arg");a.push(e)});a.push(...BuildahCli.getImageFormatOption(i));if(o){a.push(`--layers=${o}`)}if(u.length>0){a.push(...u)}a.push("-t");a.push(e);a.push(t);return this.execute(a)}async from(e){return this.execute(["from",e])}async copy(e,t,n){if(t.length===0){return undefined}s.debug("copy");s.debug(e);for(const s of t){const t=["copy",e,s];if(n){t.push(n)}return this.execute(t)}return undefined}async config(e,t){s.debug("config");s.debug(e);const n=["config"];if(t.entrypoint){n.push("--entrypoint");n.push(BuildahCli.convertArrayToStringArg(t.entrypoint))}if(t.port){n.push("--port");n.push(t.port)}if(t.envs){t.envs.forEach(e=>{n.push("--env");n.push(e)})}if(t.arch){n.push("--arch");n.push(t.arch)}if(t.workingdir){n.push("--workingdir");n.push(t.workingdir)}if(t.labels){t.labels.forEach(e=>{n.push("--label");n.push(e)})}n.push(e);return this.execute(n)}async commit(e,t,n){s.debug("commit");s.debug(e);s.debug(t);const i=["commit",...BuildahCli.getImageFormatOption(n),"--squash",e,t];return this.execute(i)}async tag(e,t){const n=["tag"];const i=[];for(const s of t){n.push(o.getFullImageName(e,s));i.push(o.getFullImageName(e,s))}s.info(`Tagging the built image with tags ${t.toString()}`);await this.execute(n);s.info(`✅ Successfully built image${i.length!==1?"s":""} "${i.join(", ")}"`)}async manifestCreate(e){const t=["manifest","create"];t.push(e);s.info(`Creating manifest ${e}`);await this.execute(t)}async manifestAdd(e,t){const n=["manifest","add"];n.push(e);n.push(t);s.info(`Adding image "${t}" to the manifest.`);await this.execute(n)}static convertArrayToStringArg(e){let t="[";e.forEach(e=>{t+=`"${e}",`});return`${t.slice(0,-1)}]`}async execute(e,t={}){let n="";let o="";const u={...t};u.ignoreReturnCode=true;u.listeners={stdline:e=>{n+=e+"\n"},errline:e=>{o+=e+"\n"}};if(t.group){const t=[this.executable,...e].join(" ");s.startGroup(t)}const c={};Object.entries(process.env).forEach(([e,t])=>{if(t!=null){c[e]=t}});if(this.storageOptsEnv){c.STORAGE_OPTS=this.storageOptsEnv}u.env=c;try{const c=await i.exec(this.executable,e,u);if(t.ignoreReturnCode!==true&&c!==0){let e=`${r.basename(this.executable)} exited with code ${c}`;if(o){e+=`\n${o}`}throw new Error(e)}return{exitCode:c,output:n,error:o}}finally{if(t.group){s.endGroup()}}}}t.BuildahCli=BuildahCli},69:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:true});t.Outputs=t.Inputs=void 0;var n;(function(e){e["ARCH"]="arch";e["ARCHS"]="archs";e["BASE_IMAGE"]="base-image";e["BUILD_ARGS"]="build-args";e["CONTAINERFILES"]="containerfiles";e["CONTENT"]="content";e["CONTEXT"]="context";e["DOCKERFILES"]="dockerfiles";e["ENTRYPOINT"]="entrypoint";e["ENVS"]="envs";e["EXTRA_ARGS"]="extra-args";e["IMAGE"]="image";e["LABELS"]="labels";e["LAYERS"]="layers";e["OCI"]="oci";e["PLATFORM"]="platform";e["PLATFORMS"]="platforms";e["PORT"]="port";e["TAGS"]="tags";e["WORKDIR"]="workdir"})(n=t.Inputs||(t.Inputs={}));var s;(function(e){e["IMAGE"]="image";e["IMAGE_WITH_TAG"]="image-with-tag";e["TAGS"]="tags"})(s=t.Outputs||(t.Outputs={}))},144:(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:true});t.run=void 0;const s=n(186);const i=n(436);const r=n(622);const o=n(69);const u=n(987);const c=n(314);async function run(){if(process.env.RUNNER_OS!=="Linux"){throw new Error("buildah, and therefore this action, only works on Linux. Please use a Linux runner.")}const e=await i.which("buildah",true);const t=new u.BuildahCli(e);await t.execute(["version"],{group:true});await t.setStorageOptsEnv();const n="latest";const r=process.env.GITHUB_WORKSPACE||process.cwd();const l=c.getContainerfiles();const a=s.getInput(o.Inputs.IMAGE);const f=s.getInput(o.Inputs.TAGS);const d=f.trim().split(/\s+/);const p=s.getInput(o.Inputs.LABELS);const h=p?c.splitByNewline(p):[];if(d.length===0){s.info(`Input "${o.Inputs.TAGS}" is not provided, using default tag "${n}"`);d.push(n)}const g=c.isFullImageName(d[0]);if(d.some(e=>c.isFullImageName(e)!==g)){throw new Error(`Input "${o.Inputs.TAGS}" cannot have a mix of full name and non full name tags. Refer to https://github.com/redhat-actions/buildah-build#image-tag-inputs`)}if(!g&&!a){throw new Error(`Input "${o.Inputs.IMAGE}" must be provided when not using full image name tags. Refer to https://github.com/redhat-actions/buildah-build#image-tag-inputs`)}const m=c.getFullImageName(a,d[0]);const y=s.getInput(o.Inputs.OCI)==="true";const w=c.getArch();const v=c.getPlatform();if(w.length>0&&v.length>0){throw new Error("The --platform option may not be used in combination with the --arch option.")}if(l.length!==0){await doBuildUsingContainerFiles(t,m,r,l,y,w,v,h)}else{if(v.length>0){throw new Error("The --platform option is not supported for builds without containerfiles.")}await doBuildFromScratch(t,m,y,w,h)}if(w.length>0||v.length>0){s.info(`Creating manifest with tag${d.length!==1?"s":""} "${d.join(", ")}"`);const e=[];const n=[];for(const s of d){const i=c.getFullImageName(a,s);await t.manifestCreate(i);n.push(i);for(const n of w){const s=c.removeIllegalCharacters(n);e.push(`${m}-${s}`);await t.manifestAdd(i,`${m}-${s}`)}for(const n of v){const s=c.removeIllegalCharacters(n);e.push(`${m}-${s}`);await t.manifestAdd(i,`${m}-${s}`)}}s.info(`✅ Successfully built image${e.length!==1?"s":""} "${e.join(", ")}" `+`and manifest${n.length!==1?"s":""} "${n.join(", ")}"`)}else if(d.length>1){await t.tag(a,d)}else if(d.length===1){s.info(`✅ Successfully built image "${c.getFullImageName(a,d[0])}"`)}s.setOutput(o.Outputs.IMAGE,a);s.setOutput(o.Outputs.TAGS,f);s.setOutput(o.Outputs.IMAGE_WITH_TAG,m)}t.run=run;async function doBuildUsingContainerFiles(e,t,n,i,u,l,a,f){if(i.length===1){s.info(`Performing build from Containerfile`)}else{s.info(`Performing build from ${i.length} Containerfiles`)}const d=r.join(n,s.getInput(o.Inputs.CONTEXT));const p=c.getInputList(o.Inputs.BUILD_ARGS);const h=i.map(e=>r.join(n,e));const g=s.getInput(o.Inputs.LAYERS);const m=s.getInput(o.Inputs.EXTRA_ARGS);let y=[];if(m){const e=c.splitByNewline(m);y=e.flatMap(e=>e.split(" ")).map(e=>e.trim())}if(l.length>0||a.length>0){for(const n of l){const s=c.removeIllegalCharacters(n);await e.buildUsingDocker(`${t}-${s}`,d,h,p,u,f,g,y,n,undefined)}for(const n of a){const s=c.removeIllegalCharacters(n);await e.buildUsingDocker(`${t}-${s}`,d,h,p,u,f,g,y,undefined,n)}}else{await e.buildUsingDocker(t,d,h,p,u,f,g,y)}}async function doBuildFromScratch(e,t,n,i,r){s.info(`Performing build from scratch`);const u=s.getInput(o.Inputs.BASE_IMAGE,{required:true});const l=c.getInputList(o.Inputs.CONTENT);const a=c.getInputList(o.Inputs.ENTRYPOINT);const f=s.getInput(o.Inputs.PORT);const d=s.getInput(o.Inputs.WORKDIR);const p=c.getInputList(o.Inputs.ENVS);const h=await e.from(u);const g=h.output.replace("\n","");if(i.length>0){for(const s of i){const i=c.removeIllegalCharacters(s);const o={entrypoint:a,port:f,workingdir:d,envs:p,arch:s,labels:r};await e.config(g,o);await e.copy(g,l);await e.commit(g,`${t}-${i}`,n)}}else{const s={entrypoint:a,port:f,workingdir:d,envs:p,labels:r};await e.config(g,s);await e.copy(g,l);await e.commit(g,t,n)}}run().catch(s.setFailed)},314:(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:true});t.removeIllegalCharacters=t.getFullImageName=t.isFullImageName=t.getCommaSeperatedInput=t.getInputList=t.getContainerfiles=t.getPlatform=t.getArch=t.splitByNewline=t.findFuseOverlayfsPath=t.isStorageDriverOverlay=void 0;const s=n(885);const i=n(747);const r=n(186);const o=n(622);const u=n(436);const c=n(87);const l=n(69);async function findStorageDriver(e){let t="";for(const n of e){r.debug(`Checking if the storage file exists at ${n}`);if(await fileExists(n)){r.debug(`Storage file exists at ${n}`);const e=s.parse(await i.promises.readFile(n,"utf-8"));if(e.storage.driver){t=e.storage.driver}}}return t}async function isStorageDriverOverlay(){let e=o.join(c.homedir(),".config");if(process.env.XDG_CONFIG_HOME){e=process.env.XDG_CONFIG_HOME}const t=["/etc/containers/storage.conf",o.join(e,"containers/storage.conf")];const n=await findStorageDriver(t);return n==="overlay"}t.isStorageDriverOverlay=isStorageDriverOverlay;async function fileExists(e){try{await i.promises.access(e);return true}catch(e){return false}}async function findFuseOverlayfsPath(){let e;try{e=await u.which("fuse-overlayfs")}catch(e){r.debug(e)}return e}t.findFuseOverlayfsPath=findFuseOverlayfsPath;function splitByNewline(e){return e.split(/\r?\n/)}t.splitByNewline=splitByNewline;function getArch(){const e=getCommaSeperatedInput(l.Inputs.ARCHS);const t=r.getInput(l.Inputs.ARCH);if(t&&e.length>0){r.warning(`Both "${l.Inputs.ARCH}" and "${l.Inputs.ARCHS}" inputs are set. `+`Please use "${l.Inputs.ARCH}" if you want to provide multiple `+`ARCH else use ${l.Inputs.ARCH}". "${l.Inputs.ARCHS}" takes preference.`)}if(e.length>0){return e}else if(t){return[t]}return[]}t.getArch=getArch;function getPlatform(){const e=r.getInput(l.Inputs.PLATFORM);const t=getCommaSeperatedInput(l.Inputs.PLATFORMS);if(e&&t.length>0){r.warning(`Both "${l.Inputs.PLATFORM}" and "${l.Inputs.PLATFORMS}" inputs are set. `+`Please use "${l.Inputs.PLATFORMS}" if you want to provide multiple `+`PLATFORM else use ${l.Inputs.PLATFORM}". "${l.Inputs.PLATFORMS}" takes preference.`)}if(t.length>0){r.debug("return platforms");return t}else if(e){r.debug("return platform");return[e]}r.debug("return empty");return[]}t.getPlatform=getPlatform;function getContainerfiles(){const e=getInputList(l.Inputs.CONTAINERFILES);const t=getInputList(l.Inputs.DOCKERFILES);if(e.length!==0&&t.length!==0){r.warning(`Both "${l.Inputs.CONTAINERFILES}" and "${l.Inputs.DOCKERFILES}" inputs are set. `+`Please use only one of these two inputs, as they are aliases of one another. `+`"${l.Inputs.CONTAINERFILES}" takes precedence.`)}return e.length!==0?e:t}t.getContainerfiles=getContainerfiles;function getInputList(e){const t=r.getInput(e);if(!t){return[]}const n=splitByNewline(t);return n.reduce((e,t)=>e.concat(t).map(e=>e.trim()),[])}t.getInputList=getInputList;function getCommaSeperatedInput(e){const t=r.getInput(e);if(t.length===0){r.debug("empty");return[]}const n=t.split(",");return n.reduce((e,t)=>e.concat(t).map(e=>e.trim()),[])}t.getCommaSeperatedInput=getCommaSeperatedInput;function isFullImageName(e){return e.indexOf(":")>0}t.isFullImageName=isFullImageName;function getFullImageName(e,t){if(isFullImageName(t)){return t}return`${e}:${t}`}t.getFullImageName=getFullImageName;function removeIllegalCharacters(e){return e.replace(/[^a-zA-Z0-9 ]/g,"")}t.removeIllegalCharacters=removeIllegalCharacters},357:e=>{"use strict";e.exports=require("assert")},129:e=>{"use strict";e.exports=require("child_process")},614:e=>{"use strict";e.exports=require("events")},747:e=>{"use strict";e.exports=require("fs")},87:e=>{"use strict";e.exports=require("os")},622:e=>{"use strict";e.exports=require("path")},669:e=>{"use strict";e.exports=require("util")}};var t={};function __webpack_require__(n){if(t[n]){return t[n].exports}var s=t[n]={exports:{}};var i=true;try{e[n].call(s.exports,s,s.exports,__webpack_require__);i=false}finally{if(i)delete t[n]}return s.exports}__webpack_require__.ab=__dirname+"/";return __webpack_require__(144)})();
//# sourceMappingURL=index.js.map