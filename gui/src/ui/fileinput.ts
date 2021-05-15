import { Button, Panel } from "@repcomm/exponent-ts";
import { Title } from "./title";

export class FileInput extends Panel {
  private title: Title;
  private selectBtn: Button;
  private filePath: Panel;

  constructor () {
    super();
    this.addClasses("fileinput");

    this.title = new Title("File")
    .addClasses("fileinput-title")
    .mount(this);

    this.selectBtn = new Button()
    .addClasses("fileinput-select")
    .setTextContent("Select File")
    .mount(this);

    this.filePath = new Panel()
    .addClasses("fileinput-path")
    .mount(this);
  }
  setTitle (text: string): this {
    this.title.setTextContent(text);
    return this;
  }
  setFilePath (fpath: string): this {
    this.filePath.setTextContent(fpath);
    return this;
  }
  getFilePath (): string {
    return this.filePath.getTextContent();
  }
  getSelectButton (): Button {
    return this.selectBtn;
  }
}
