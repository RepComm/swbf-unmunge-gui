import { Button, Panel } from "@repcomm/exponent-ts";


export class FileList extends Panel {
  private files: Set<string>;
  private addFilesBtn: Button;
  private filesList: Panel;

  constructor () {
    super();
    this.files = new Set();

    this.addClasses("file-list");

    this.addFilesBtn = new Button()
    .setTextContent("Add Files")
    .addClasses("file-list-add")
    .mount(this);

    this.filesList = new Panel()
    .addClasses("files-list-display")
    .mount(this);
  }
  getAddFilesButton (): Button {
    return this.addFilesBtn;
  }
  redraw () {
    let str = "";
    let fname: string;
    let idx = 0;
    for (let file of this.files) {
      idx = Math.max(
        file.lastIndexOf("/"),
        file.lastIndexOf("\\")
      ) + 1;
      fname = file.substring(idx);
      str += `${fname}\n`;
    }
    this.filesList.setTextContent(str);
  }
  addFiles (files: string[], redraw: boolean = true): this {
    for (let file of files) {
      if (!this.files.has(file)) this.files.add(file);
    }
    if (redraw) this.redraw();
    return this;
  }
  getFiles (): string[] {
    let result = new Array<string>(this.files.size);
    let i=0;
    for (let file of this.files) {
      result[i] = file;
      i++;
    }
    return result;
  }
}
