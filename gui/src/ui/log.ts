import { Panel } from "@repcomm/exponent-ts";

export class LogMessage extends Panel {
  log: Log;
  constructor () {
    super();
    this.addClasses("log-message");
  }
  remove () {
    if (this.log) this.log.remove(this);
  }
  setTextColor (color: string): this {
    this.setStyleItem("color", color);
    return this;
  }
  setBackgroundColor (color: string): this {
    this.setStyleItem("background-color", color);
    return this;
  }
}

export class Log extends Panel {
  private msgs: Set<LogMessage>;
  private messageArea: Panel;

  constructor () {
    super();
    this.addClasses("log");

    this.msgs = new Set();
    
    this.messageArea = new Panel()
    .addClasses("log-message-area")
    .mount(this);
  }
  add (msg: LogMessage): this {
    this.msgs.add(msg);
    msg.mount(this.messageArea);
    return this;
  }
  create (text: string, textColor?: string, bgColor?: string): this {
    let msg = new LogMessage()
    .setTextContent(text);
    if (textColor) msg.setTextColor(textColor);
    if (bgColor) msg.setBackgroundColor(bgColor);
    this.add(msg);
    return this;
  }
  remove (msg: LogMessage): this {
    msg.unmount();
    this.msgs.delete(msg);
    return this;
  }
}
