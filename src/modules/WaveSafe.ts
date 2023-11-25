//@ts-ignore
import Tray from "trayicon";
import fs from "fs/promises";

export class WaveSafe {
  tray: any;
  activeState = false;

  async initialize() {
    this.tray = await Tray.create({
      title: "WaveSafe",
      icon: await fs.readFile("src/assets/icon.ico"),
      action: () => this.toggleActivation(),
      useTempDir: true,
    });

    let main = this.tray.item("Power");

    main.add(this.tray.item("on"), this.tray.item("on"));

    let quit = this.tray.item("Quit", () => this.tray.kill());
    this.tray.setMenu(main, quit);
  }

  toggleActivation() {
    this.activeState ? this.deactivate() : this.activate();
    console.log(`State: ${this.activeState ? "running" : "stopped"}`);
  }

  activate() {
    this.tray.notify("WaveSafe", "RUNNING");
    this.activeState = true;
  }

  deactivate() {
    this.tray.notify("WaveSafe", "STOPPED");
    this.activeState = false;
  }
}
