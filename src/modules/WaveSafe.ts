//@ts-ignore
import Tray from "trayicon";
import fs from "fs/promises";

export class WaveSafe {
  tray: any;
  activeState = false;

  async initialize() {
    this.tray = await Tray.create({
      title: "WaveSafe",
      icon: await fs.readFile("src/assets/idle.png"),
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

    let quit = this.tray.item("Quit", () => this.tray.kill());
    this.tray.setMenu(intervall, this.tray.separator(), quit);
  }

  toggleActivation() {
    this.activeState ? this.deactivate() : this.activate();
    console.log(`State: ${this.activeState ? "running" : "stopped"}`);
  }

  async activate() {
    this.tray.setIcon(await fs.readFile("src/assets/active.png"));
    this.tray.notify("WaveSafe", "RUNNING");
    this.activeState = true;
  }

  async deactivate() {
    this.tray.setIcon(await fs.readFile("src/assets/inactive.png"));
    this.tray.notify("WaveSafe", "STOPPED");
    this.activeState = false;
  }
}
