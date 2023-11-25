//@ts-ignore
import Tray from "trayicon";
import fs from "fs/promises";

let active = false;

function toggleActivation() {
  active ? deactivate() : activate();
  console.log(`State: ${active ? "running" : "stopped"}`);
}

function activate() {
  active = true;
}

function deactivate() {
  active = false;
}

export async function tray() {
  const tray = await Tray.create({
    title: "WaveSafe",
    icon: await fs.readFile("src/icon.ico"),
    action: toggleActivation,
    useTempDir: true,
  });

  let main = tray.item("Power");

  main.add(tray.item("on"), tray.item("on"));

  let quit = tray.item("Quit", () => tray.kill());
  tray.setMenu(main, quit);

  console.log("done");
}
