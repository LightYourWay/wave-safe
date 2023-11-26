//@ts-ignore
import Tray from "trayicon";
import fs from "fs/promises";
import { getPath } from "./Helpers";

export class WaveSafe {
  tray: any;
  activeState = false;


  async initialize() {
    this.tray = await Tray.create({
      title: "WaveSafe",
      icon: await fs.readFile(getPath("public/idle.png")),
      action: () => this.toggleActivation(),
      useTempDir: true,
    });

    const intervall = this.tray.item("Intervall");

    intervall.add(
      this.tray.item("onChange", {
        checked: true,
      }),
      this.tray.item("30 sec"),
      this.tray.item("1 min"),
      this.tray.item("2 min"),
    );

    const quit = this.tray.item("Quit", () => this.tray.kill());
    this.tray.setMenu(intervall, this.tray.separator(), quit);
  }

  toggleActivation() {
    this.activeState ? this.deactivate() : this.activate();
    console.log(`State: ${this.activeState ? "running" : "stopped"}`);
  }

  async activate() {
    this.tray.setIcon(await fs.readFile(getPath("public/active.png")));
    this.tray.notify("WaveSafe", "RUNNING");
    this.activeState = true;
  }

  async deactivate() {
    this.tray.setIcon(await fs.readFile(getPath("public/inactive.png")));
    this.tray.notify("WaveSafe", "STOPPED");
    this.activeState = false;
  }
}
