//@ts-ignore
import Tray from "trayicon";
import fs from "fs/promises";

interface trayItem {
  name: string;
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  bold?: boolean;
  action?: () => void;
  isSeparator?: boolean;
}

export class Frontend {
  tray: any;
  options: trayItem[] = [];

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

  private defaultOptions: trayItem[] = [
    {
      name: "separator",
      isSeparator: true,
    },
    {
      name: "quit",
      label: "Quit",
      action: () => this.tray.kill(),
    }
  ];


  addOption(option: trayItem) {
    this.options.push(option);
    this.redraw();
  }

  updateOption(name: string, option: trayItem) {
    const index = this.options.findIndex((item) => item.name == name);
    if (index != -1) {
      this.options[index] = option;
      this.redraw();
    }
  }

  removeOption(name: string) {
    const index = this.options.findIndex((item) => item.name == name);
    if (index != -1) {
      this.options.splice(index, 1);
      this.redraw();
    }
  }

  getOption(name: string) {
    const index = this.options.findIndex((item) => item.name == name);
    if (index != -1) {
      return this.options[index];
    }
  }

  setAttributeOnOption(name: string, attribute: string, value: any) {
    const index = this.options.findIndex((item) => item.name == name);
    if (index != -1) {
      this.options[index][attribute] = value;
      this.redraw();
    }
  }

  redraw() {
    let userItems: any[] = [];
    for (const option of this.options) {
      if (option.isSeparator) {
        userItems.push(this.tray.separator());
      } else {
        userItems.push(this.tray.item(option.label ? option.label : "", {
          checked: option.checked ? option.checked : false,
          disabled: option.disabled ? option.disabled : false,
          bold: option.bold ? option.bold : false,
          action: () => option.action ? option.action() : null,
        }));
      }
    }

    let defaultItems: any[] = [];
    for (const option of this.defaultOptions) {
      if (option.isSeparator) {
        defaultItems.push(this.tray.separator());
      } else {
        defaultItems.push(this.tray.item(option.label ? option.label : "", {
          checked: option.checked ? option.checked : false,
          disabled: option.disabled ? option.disabled : false,
          bold: option.bold ? option.bold : false,
          action: () => option.action ? option.action() : null,
        }));
      }
    }

    this.tray.setMenu(...userItems, ...defaultItems);
  }
}
