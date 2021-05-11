
import { Exponent, EXPONENT_CSS_STYLES, Panel, runOnce } from "@repcomm/exponent-ts";

import { Title } from "./ui/title";
import { FileList } from "./ui/filelist";
import { Select } from "./ui/select";

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
  sendIPCJsonMessage({
    type: "select-files"
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
}

const mainOpts = new MainOptions()
.mount(container);

interface IPCJsonMessage {
  type: "select-files"|"select-files-response"|"run-cli"|"bad-action";
  message?: string;
  status?: "success"|"failure",
  result?: {
    filePaths?: string[]
  }
}

function sendIPCJsonMessage (msg: IPCJsonMessage) {
  window["api"].send("main", JSON.stringify(msg));
}

window["api"].receive("main", (data) => {
  // console.log(`Received "${data}"`);
  let msg: IPCJsonMessage;
  try {
    msg = JSON.parse(data);
  } catch (ex) {
    console.error("Couldn't parse message from main ipc", ex);
    return;
  }

  switch (msg.type) {
    case "select-files-response":
      flist.addFiles(msg.result.filePaths);
      // console.log("Select files response", msg.result.filePaths);
      break;
    case "bad-action":
      console.error("bad action", msg);
      break;
    default:
      //TODO handle
      break;
  }
});
