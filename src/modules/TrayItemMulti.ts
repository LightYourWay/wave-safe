import { Frontend } from "./Frontend";
import { storage } from "./Storage";
import { TrayItem } from "./TrayItem";
import { TrayItemSingle } from "./TrayItemSingle";

interface TrayItemMultiOptions {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  bold?: boolean;
  action?: () => void;

  options: TrayItemSingle[];
  initialOption?: number;
}

export class TrayItemMulti extends TrayItem implements TrayItemMultiOptions {
  private _visibility: boolean = true;
  private _label: string;
  private _checked?: boolean;
  private _disabled?: boolean;
  private _bold?: boolean;
  private _action?: () => void;

  options: TrayItemSingle[];
  selected: TrayItemSingle;

  private initialLabel: string;

  constructor(frontend: Frontend, options: TrayItemMultiOptions) {
    super(frontend);

    this.initialLabel = options.label;

    this._label = options.label;
    this._checked = options.checked;
    this._disabled = options.disabled;
    this._bold = options.bold;
    this._action = options.action;

    this.options = options.options;
    for (const option of this.options) {
      option.action = () => this.select(option);
    }

    this.selected = this.options[options.initialOption || 0];
    this.select(this.selected);
  }

  select(option: TrayItemSingle) {
    this.selected = option;
    for (const option of this.options) {
      option.checked = option === this.selected;
    }
    storage.setItem(
      this.initialLabel.toLowerCase().replace(" ", "_"),
      this.options.indexOf(this.selected),
    );
    this.label = `${this.initialLabel}: ${this.selected.label}`;
  }

  public set visibility(value: boolean) {
    this._visibility = value;
    this.frontend.redraw();
  }

  public get visibility(): boolean {
    return this._visibility;
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
    const mainItem = this.frontend.tray.item(this._label, {
      checked: this._checked,
      disabled: this._disabled,
      bold: this._bold,
      action: () => (this._action ? this._action() : null),
    });

    let options: any = [];
    for (const option of this.options) {
      options.push(option.create());
    }
    mainItem.add(...options);

    return mainItem;
  }
}
