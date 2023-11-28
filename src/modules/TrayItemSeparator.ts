import { Frontend } from "./Frontend";
import { TrayItem } from "./TrayItem";

export class TrayItemSeparator extends TrayItem {
  constructor(frontend: Frontend) {
    super(frontend);
  }

  create() {
    return this.frontend.tray.separator();
  }
}
