import { Frontend } from "./Frontend";

export abstract class TrayItem {
  protected frontend: Frontend;

  constructor(frontend: Frontend) {
    this.frontend = frontend;
  }

  abstract create(): any;
}
