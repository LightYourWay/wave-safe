import { State } from "./State";
import { Tray } from "./Tray";

export interface TrayItemOptions {
  devModeOnly?: boolean;
}
export abstract class TrayItem {
  public options: TrayItemOptions;

  constructor(options?: TrayItemOptions) {
    this.options = options || {};
  }

  protected gracefulRedraw() {
    if (State?.initialized) Tray.redraw();
  }

  abstract create(): any;
}
