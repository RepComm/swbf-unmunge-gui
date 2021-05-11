import { Exponent } from "@repcomm/exponent-ts";

export class Title extends Exponent {
  constructor (text: string = "Title") {
    super();
    this.make("span")
    .addClasses("title")
    .applyRootClasses()
    .setTextContent(text);
  }
}
