import { showConsole, hideConsole } from "node-hide-console-window";

export class Backend {
  visible = true;

  constructor() {
    this.hide();
  }

  show() {
    if (process.env.NODE_ENV == "development") return;
    // console.log("Opening Console...");
    console.clear();
    showConsole();
    this.visible = true;
  }

  hide() {
    if (process.env.NODE_ENV == "development") return;
    // console.log("Hiding into Tray...");
    hideConsole();
    console.clear();
    this.visible = false;
  }
}
