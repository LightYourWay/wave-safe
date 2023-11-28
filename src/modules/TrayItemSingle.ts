import { Frontend } from "./Frontend";
import { TrayItem } from "./TrayItem";

interface TrayItemSingleOptions {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  bold?: boolean;
  action?: () => void;
  value?: any;
}

export class TrayItemSingle extends TrayItem implements TrayItemSingleOptions {
  private _label: string;
  private _checked?: boolean;
  private _disabled?: boolean;
  private _bold?: boolean;
  private _action?: () => void;
  value?: any;

  constructor(frontend: Frontend, options: TrayItemSingleOptions) {
    super(frontend);
    this._label = options.label;
    this._checked = options.checked;
    this._disabled = options.disabled;
    this._bold = options.bold;
    this._action = options.action;
    this.value = options.value;
  }

  public set label(value: string) {
    this._label = value;
    this.frontend.redraw();
  }

  public get label(): string {
    return this._label;
  }

  public set checked(value: boolean) {
    this._checked = value;
    this.frontend.redraw();
  }

  public get checked(): boolean | undefined {
    return this._checked;
  }

  public set disabled(value: boolean) {
    this._disabled = value;
    this.frontend.redraw();
  }

  public get disabled(): boolean | undefined {
    return this._disabled;
  }

  public set bold(value: boolean) {
    this._bold = value;
    this.frontend.redraw();
  }

  public get bold(): boolean | undefined {
    return this._bold;
  }

  public set action(value: () => void) {
    this._action = value;
    this.frontend.redraw();
  }

  public get action(): (() => void) | undefined {
    return this._action;
  }

  create() {
    return this.frontend.tray.item(this._label, {
      checked: this._checked,
      disabled: this._disabled,
      bold: this._bold,
      action: () => (this._action ? this._action() : null),
    });
  }
}
