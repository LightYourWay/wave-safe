import { State } from "./State";
import { Tray } from "./Tray";
import { TrayItem, TrayItemOptions } from "./TrayItem";

interface TrayItemSingleOptions {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  bold?: boolean;
  action?: () => void;
  value?: any;
}

export class TrayItemSingle extends TrayItem implements TrayItemSingleOptions {
  private _visibility: boolean = true;
  private _label: string;
  private _checked?: boolean;
  private _disabled?: boolean;
  private _bold?: boolean;
  private _action?: () => void;
  value?: any;

  constructor(options: TrayItemSingleOptions & TrayItemOptions) {
    super(options);
    this._label = options.label;
    this._checked = options.checked;
    this._disabled = options.disabled;
    this._bold = options.bold;
    this._action = options.action;
    this.value = options.value;
  }

  public set visibility(value: boolean) {
    this._visibility = value;
    this.gracefulRedraw();
  }

  public get visibility(): boolean {
    return this._visibility;
  }

  public set label(value: string) {
    this._label = value;
    this.gracefulRedraw();
  }

  public get label(): string {
    return this._label;
  }

  public set checked(value: boolean) {
    this._checked = value;
    this.gracefulRedraw();
  }

  public get checked(): boolean | undefined {
    return this._checked;
  }

  public set disabled(value: boolean) {
    this._disabled = value;
    this.gracefulRedraw();
  }

  public get disabled(): boolean | undefined {
    return this._disabled;
  }

  public set bold(value: boolean) {
    this._bold = value;
    this.gracefulRedraw();
  }

  public get bold(): boolean | undefined {
    return this._bold;
  }

  public set action(value: () => void) {
    this._action = value;
    this.gracefulRedraw();
  }

  public get action(): (() => void) | undefined {
    return this._action;
  }

  create() {
    return Tray.createItem(this._label, {
      checked: this._checked,
      disabled: this._disabled,
      bold: this._bold,
      action: () => (this._action ? this._action() : null),
    });
  }
}
