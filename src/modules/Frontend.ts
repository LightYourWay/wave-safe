//@ts-ignore
import Tray from "trayicon";
import fs from "fs/promises";

export class Frontend {
  tray: any;

  async initialize({
    title,
    iconPath,
    action,
    useTempDir,
  }: {
    title: string;
    iconPath: string;
    action: () => void;
    useTempDir: boolean;
  }) {
    this.tray = await Tray.create({
      title: title,
      icon: await fs.readFile(iconPath),
      action: () => action(),
      useTempDir: useTempDir,
    });
    return this;
  }
}
