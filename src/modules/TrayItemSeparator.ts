import { Frontend } from "./Frontend";
import { TrayItem } from "./TrayItem";

export class TrayItemSeparator extends TrayItem {
  private _visibility: boolean = true;

  constructor(frontend: Frontend) {
    super(frontend);
  }

  create() {
    return this.frontend.tray.separator();
  }

  public set visibility(value: boolean) {
    this._visibility = value;
    this.frontend.redraw();
  }

  public get visibility(): boolean {
    return this._visibility;
  }
}
