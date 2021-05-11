
import { Exponent, EXPONENT_CSS_STYLES, Panel, runOnce } from "@repcomm/exponent-ts";

runOnce();

EXPONENT_CSS_STYLES.mount(document.head);

const STYLES = new Exponent()
.make("style")
.setTextContent(`
body {
  color: white;
  background-color: #242424;
}
.title {
  text-align: center;
}
`)
.mount(document.head);

class Title extends Exponent {
  constructor (text: string = "Title") {
    super();
    this.make("span")
    .addClasses("title")
    .applyRootClasses()
    .setTextContent(text);
  }
}

const container = new Panel()
.setId("container")
.mount(document.body);

const title = new Title("swbf-unmunge-gui")
.mount(container);

window["api"].receive("fromMain", (data) => {
  console.log(`Received "${data}"`);
});
window["api"].send("toMain", "some data");
// console.log(window["api"]);

