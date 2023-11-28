//@ts-ignore
import Tray from "trayicon";
import fs from "fs/promises";
import { TrayItem } from "./TrayItem";
import { TrayItemSeparator } from "./TrayItemSeparator";
import { TrayItemSingle } from "./TrayItemSingle";

export class Frontend {
  tray: any;
  options: TrayItem[] = [];

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

  private defaultOptions: TrayItem[] = [
    new TrayItemSeparator(this),
    new TrayItemSingle(this, {
      label: "Quit",
      action: () => this.tray.kill(),
    }),
  ];

  registerItem(option: TrayItem) {
    this.options.push(option);
    this.redraw();
  }

  redraw() {
    let userItems: any[] = [];
    for (const option of this.options) {
      userItems.push(option.create());
    }

    let defaultItems: any[] = [];
    for (const option of this.defaultOptions) {
      defaultItems.push(option.create());
    }

    this.tray.setMenu(...userItems, ...defaultItems);
  }
}
