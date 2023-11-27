import fs from "fs/promises";
import { getPath } from "./Helpers";
import { Backend } from "./Backend";
import { Frontend } from "./Frontend";
import { selectFile } from "./PathPicker";

export class WaveSafe {
  frontend: Frontend;
  backend: Backend;
  activated = false;
  options: any = [];

  consoleToggleItem: any;

  constructor(backend: Backend, frontend: Frontend) {
    this.frontend = frontend;
    this.backend = backend;

    this.addOptions();
  }

  addOptions() {
    this.frontend.addOption({
      name: "selectSource",
      label: "Select Source",
      action: () => this.selectSource(),
    });

    // const intervall = this.frontend.tray.item("Intervall");

    // intervall.add(
    //   this.frontend.tray.item("onChange", {
    //     checked: true,
    //   }),
    //   this.frontend.tray.item("30 sec"),
    //   this.frontend.tray.item("1 min"),
    //   this.frontend.tray.item("2 min"),
    // );

    console.log(this.frontend.getOption("selectSource"));

    this.frontend.addOption({
      name: "toggleConsole",
      label: "Show Console",
      checked: false,
      action: () => this.toggleConsole(),
    });
    // this.consoleToggleItem = this.frontend.tray.item("Show Console", {
    //   checked: false,
    //   action: () => this.toggleConsole(),
    // });

    // const quit = this.frontend.tray.item("Quit", () =>
    //   this.frontend.tray.kill(),
    // );

    // let devOnlyElements: any = [];
    // let releaseOnlyElements: any = [];
    // if (process.env.NODE_ENV == "development") {
    //   devOnlyElements = [];
    // } else {
    //   releaseOnlyElements = [this.consoleToggleItem];
    // }

    // this.frontend.tray.setMenu(
    //   this.options.selectSource,
    //   intervall,
    //   this.frontend.tray.separator(),
    //   ...releaseOnlyElements,
    //   ...devOnlyElements,
    //   quit,
    // );
  }

  toggleConsole() {
    this.backend.visible ? this.hideConsole() : this.showConsole();
  }

  hideConsole() {
    this.backend.hide();
    this.frontend.setAttributeOnOption("toggleConsole", "checked", false);
  }

  showConsole() {
    this.backend.show();
    this.frontend.setAttributeOnOption("toggleConsole", "checked", true);
  }

  async selectSource() {
    const filePath = await selectFile({
      title: "Select My Source",
      filter: {
        items: [
          {
            name: "Waves LV1 Backup File",
            extension: "*.dat",
          },
        ],
        index: 1,
      },
    }).catch((err) => {});
    if (filePath) {
      console.log(filePath);
      this.options.selectSource = this.frontend.tray.item(filePath, () =>
        this.selectSource(),
      );
      this.frontend.tray.setMenu(this.options.selectSource);
    }
  }

  async toggleActivation() {
    this.activated ? await this.deactivate() : await this.activate();
    console.log(`State: ${this.activated ? "running" : "stopped"}`);
  }

  async activate() {
    this.frontend.tray.setIcon(await fs.readFile(getPath("public/active.png")));
    this.frontend.tray.notify("WaveSafe", "RUNNING");
    this.activated = true;
  }

  async deactivate() {
    this.frontend.tray.setIcon(
      await fs.readFile(getPath("public/inactive.png")),
    );
    this.frontend.tray.notify("WaveSafe", "STOPPED");
    this.activated = false;
  }
}
