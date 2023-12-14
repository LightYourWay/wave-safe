import TrayHandler from "trayicon";
import { ItemOptions, Tray as TrayHandlerType } from "trayicon";
import fs from "fs/promises";
import { TrayItem } from "./TrayItem";
import { TrayItemSeparator } from "./TrayItemSeparator";
import { TrayItemSingle } from "./TrayItemSingle";
import { TrayItems } from "./TrayItems";
import { Config } from "./Config";
import { State } from "./State";

class TrayProxy {
  trayHandler: TrayHandlerType = {} as TrayHandlerType;
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
    this.trayHandler = await TrayHandler.create({
      title: title,
      icon: await fs.readFile(iconPath),
      action: () => action(),
      useTempDir: useTempDir,
    });

    return this;
  }

  private defaultOptions: TrayItem[] = [
    new TrayItemSeparator(),
    new TrayItemSingle({
      label: "Quit",
      action: () => this.trayHandler.kill(),
    }),
  ];

  createItem(label: string, options?: ItemOptions) {
    return this.trayHandler.item(label, options);
  }

  createSeparator() {
    return this.trayHandler.separator();
  }

  setIcon(icon: Buffer) {
    this.trayHandler.setIcon(icon);
  }

  notify(title: string, message: string, action?: Function) {
    this.trayHandler.notify(title, message, action);
  }

  registerItem(option: TrayItem) {
    this.options.push(option);
    this.redraw();
  }

  redraw() {
    let userItems: any[] = [];
    for (const option of Object.values(TrayItems)) {
      userItems.push(option.create());
    }

    let defaultItems: any[] = [];
    for (const option of this.defaultOptions) {
      defaultItems.push(option.create());
    }

    this.trayHandler.setMenu(...userItems, ...defaultItems);
  }
}

export const Tray = new TrayProxy();
