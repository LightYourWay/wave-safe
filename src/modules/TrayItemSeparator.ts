import { State } from "./State";
import { Tray } from "./Tray";
import { TrayItem, TrayItemOptions } from "./TrayItem";

export class TrayItemSeparator extends TrayItem {
  private _visibility: boolean = true;

  constructor(options?: TrayItemOptions) {
    super(options);
  }

  create() {
    return Tray.createSeparator();
  }

  public set visibility(value: boolean) {
    this._visibility = value;
    this.gracefulRedraw();
  }

  public get visibility(): boolean {
    return this._visibility;
  }
}
