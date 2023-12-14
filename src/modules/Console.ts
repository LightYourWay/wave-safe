import { showConsole, hideConsole } from "node-hide-console-window";
import { TrayItems } from "./TrayItems";

export class ConsoleHandler {
  visible = true;

  show() {
    if (process.env.NODE_ENV == "development") return;
    // console.log("Opening Console...");
    showConsole();
    this.visible = true;

    TrayItems.consoleToggle.checked = true;
  }

  hide() {
    if (process.env.NODE_ENV == "development") return;
    // console.log("Hiding into Tray...");
    hideConsole();
    this.visible = false;

    TrayItems.consoleToggle.checked = false;
  }
}

export const Console = new ConsoleHandler();
