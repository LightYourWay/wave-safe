import { showConsole, hideConsole } from "node-hide-console-window";

export class Backend {
  visible = true;

  constructor() {
    this.hide();
  }

  show() {
    showConsole();
    this.visible = true;
  }

  hide() {
    hideConsole();
    this.visible = false;
  }
}
