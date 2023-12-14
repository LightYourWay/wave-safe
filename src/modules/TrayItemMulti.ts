import { Tray } from "./Tray";
import { Storage } from "./Storage";
import { TrayItem, TrayItemOptions } from "./TrayItem";
import { TrayItemSingle } from "./TrayItemSingle";
import { State } from "./State";
import { Config, MultiSelectOptions } from "./Config";
import { camelize } from "./Helpers";

interface TrayItemMultiOptions {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  bold?: boolean;
  action?: () => void;

  selects: TrayItemSingle[];
  initialOption?: number;
}

export class TrayItemMulti extends TrayItem implements TrayItemMultiOptions {
  private _visibility: boolean = true;
  private _label: string;
  private _checked?: boolean;
  private _disabled?: boolean;
  private _bold?: boolean;
  private _action?: () => void;

  selects: TrayItemSingle[];
  selected: TrayItemSingle;

  private initialLabel: string;

  constructor(options: TrayItemMultiOptions & TrayItemOptions) {
    super(options);

    this.initialLabel = options.label;

    this._label = options.label;
    this._checked = options.checked;
    this._disabled = options.disabled;
    this._bold = options.bold;
    this._action = options.action;

    this.selects = options.selects;
    for (const option of this.selects) {
      option.action = () => this.select(option);
    }

    this.selected = this.selects[options.initialOption || 0];
    this.select(this.selected);
  }

  select(option: TrayItemSingle) {
    this.selected = option;
    for (const option of this.selects) {
      option.checked = option === this.selected;
    }

    if (State?.initialized)
      Config[camelize(this.initialLabel) as keyof MultiSelectOptions] =
        this.selects.indexOf(this.selected);
    this.label = `${this.initialLabel}: ${this.selected.label}`;
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
    const mainItem = Tray.createItem(this._label, {
      checked: this._checked,
      disabled: this._disabled,
      bold: this._bold,
      action: () => (this._action ? this._action() : null),
    });

    let options: any = [];
    for (const option of this.selects) {
      options.push(option.create());
    }
    mainItem.add(...options);

    return mainItem;
  }
}
