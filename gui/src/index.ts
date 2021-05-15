
import { Button, Exponent, EXPONENT_CSS_STYLES, Panel, runOnce } from "@repcomm/exponent-ts";

import { Title } from "./ui/title";
import { FileList } from "./ui/filelist";
import { Select } from "./ui/select";
import { FileInput } from "./ui/fileinput";
import { Log } from "./ui/log";

runOnce();

EXPONENT_CSS_STYLES.mount(document.head);

const STYLES = new Exponent()
.make("style")
.setTextContent(`
body {
  color: white;
  background-color: #242424;
  font-family:'Courier New', Courier, monospace;
}
#container {
  flex-direction: column;
}
.title {
  text-align: center;
}
.file-list {
  flex-direction: column;
}
.file-list-add {
  background-color: #797878;
  color: inherit;
  padding: 0.5em;
  margin: 0.5em;
  border-radius: 0.25em;
}
.files-list-display {
  white-space: pre;
  background-color: #1d1d1d;
  padding: 0.5em;
  margin: 0.5em;
  border-radius: 0.25em;
  height: 6em;
  overflow-y: auto;
}

.main-options {
  flex-direction: column;
}
.select-panel {
  margin-bottom: 1em;
}
.select-panel-select {
  height: 2em;
  background-color: #0c0c0c;
  color: inherit;
  border-radius: 0.5em;
  border: none;
  text-indent: 1em;
}
.select-panel-title {
  text-align: right;
}
.fileinput-path {
  word-break: break-all;
}
.exponent-button {
  background-color: #0c0c0c;
}
.fileinput-select {
  height: 2em;
  color: inherit;
  border-radius: 0.5em;
  flex: 0.5;
}
#go-button {
  height: 2em;
  color: inherit;
  border-radius: 0.5em;
  margin: 1em;
  background-color: #2c5103;
  font-size: large;
  padding: 0.5em;
}
.log-message-area {
  flex-direction: column;
  height: 6em;
  /* max-height: 4em; */
  overflow-x: hidden;
  overflow-y: scroll;
  margin: 0em 1em 0em 1em;
  border-radius: 0.5em;
  background-color: #0a0a0a;
}
.log-message {
  margin: 0.25em 2em 0em 2em;
  word-break: break-all;
  padding: 0.25em;
  background-color: #232323;
  white-space: pre-wrap;
  border-radius: 0.25em;
  color: #a1ccab;
}
`)
.mount(document.head);

const container = new Panel()
.setId("container")
.mount(document.body);

const title = new Title("swbf-unmunge-gui")
.mount(container);

const flist = new FileList()
.mount(container);
flist.getAddFilesButton().on("click", (evt)=>{
  ipcDoCommand({
    type: "select-files"
  }).then((result)=>{
    if (!result || !result.result || !result.result.filePaths || result.result.filePaths.length < 1) return;
    flist.addFiles(result.result.filePaths, true);
  });
});

class MainOptions extends Panel {
  private sourceGameVersion: Select;
  private sourcePlatform: Select;
  private targetGameVersion: Select;
  private targetImageFormat: Select;
  private verbosity: Select;
  private mode: Select;

  constructor () {
    super();

    this.addClasses("main-options");

    //version arg
    this.sourceGameVersion = new Select()
    .setTitle("Source Game (version)")
    .addOptions(["swbf_ii", "swbf"])
    .setSelectedValue("swbf_ii")
    .addClasses("main-opts-src-game-version")
    .mount(this);

    //outversion arg
    this.targetGameVersion = new Select()
    .setTitle("Target Game (outversion)")
    .addOptions(["swbf_ii", "swbf"])
    .setSelectedValue("swbf_ii")
    .addClasses("main-opts-dst-game-version")
    .mount(this);

     //imgfmt arg
     this.targetImageFormat = new Select()
     .setTitle("Target Image Format (imgfmt)")
     .addOptions(["tga", "png", "dds"])
     .setSelectedValue("tga")
     .addClasses("main-opts-dst-image-format")
     .mount(this);

    this.sourcePlatform = new Select()
    .setTitle("Source Platform (platform)")
    .addOptions(["pc", "ps2", "xbox"])
    .setSelectedValue("pc")
    .addClasses("main-opts-src-platform")
    .mount(this);

    this.verbosity = new Select()
    .setTitle("Verbosity (verbose)")
    .addOptions(["normal", "verbose"])
    .setSelectedValue("normal")
    .addClasses("main-opts-verbosity")
    .mount(this);

    this.mode = new Select()
    .setTitle("Mode (mode)")
    .addOptions(["extract","explode", "assemble"])
    .setSelectedValue("extract")
    .addClasses("main-opts-mode")
    .mount(this);

  }
  getOutput (): string [] {
    let result = new Array<string>();

    result.push(`-version ${this.sourceGameVersion.getSelectedValue()}`);
    result.push(`-outversion ${this.targetGameVersion.getSelectedValue()}`);
    result.push(`-imgfmt ${this.targetImageFormat.getSelectedValue()}`);
    result.push(`-platform ${this.sourcePlatform.getSelectedValue()}`);
    if (this.verbosity.getSelectedValue() == "verbose") result.push("-verbose");
    result.push(`-mode ${this.mode.getSelectedValue()}`);

    return result;
  }
}

const mainOpts = new MainOptions()
.mount(container);

const cliPathSelector = new FileInput()
.setTitle("swbf-unmunge path:")
.mount(container);
cliPathSelector.getSelectButton().on("click", ()=>{
  ipcDoCommand({
    type: "select-file-swbfunmunge"
  }).then((result)=>{
    if (!result || !result.result || !result.result.filePaths || result.result.filePaths.length < 1) return;
    cliPathSelector.setFilePath(result.result.filePaths[0]);
    console.log("set path to swbf-unmunge:", result.result.filePaths[0]);
  });
});
cliPathSelector.setFilePath(".\\swbf-unmunge.exe")

const goBtn = new Button()
.setId("go-button")
.setTextContent("Go")
.on("click", ()=>{
  let path = cliPathSelector.getFilePath();
  let args = "";
  args += `-files ${flist.getFiles().join(";")} `;
  args += mainOpts.getOutput().join(" ");
  // console.log(command);
  ipcDoCommand({
    type: "unmunge",
    unmunge: {
      path: path,
      args: args
    }
  });
})
.mount(container);

const log = new Log()
.setId("log")
.mount(container);

interface IPCJsonMessage {
  type: "select-files"|
  "select-files-response"|
  "unmunge"|
  "bad-action"|
  "select-file-swbfunmunge-response"|
  "select-file-swbfunmunge"|
  "files-exist";
  message?: string;
  status?: "success"|"failure",
  result?: {
    filePaths?: string[]
  },
  input?: {
    filePaths?: string[]
  },
  unmunge?: {
    path: string,
    args: string
  }
}

function ipcDoCommand (msgIn: IPCJsonMessage): Promise<IPCJsonMessage> {
  return new Promise(async (_resolve, _reject)=>{
    let strIn = JSON.stringify(msgIn);

    let strOut = await window["api"].invoke("main", strIn);
    let msgOut: IPCJsonMessage;
    try {
      msgOut = JSON.parse(strOut);
    } catch {
      _reject(`Could not parse json from "${strOut}"`);
      return;
    }
    _resolve(msgOut);
    return;
  });

}

window["api"].receive("main-log", (data)=>{
  // console.log(data);
  log.create(data);
});