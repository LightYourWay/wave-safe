import { Storage } from "./Storage";

import fse from "fs-extra";
import { getPath } from "./Helpers";
const packageJSON = JSON.parse(
  fse.readFileSync(getPath("package.json")).toString(),
);

export interface MultiSelectOptions {
  intervall: number;
  keep: number;
}

interface SavedConfigOptions extends MultiSelectOptions {
  sourceFile?: string;
  destinationFolder?: string;
  projectName?: string;
}

const defaultConfig: SavedConfigOptions = {
  intervall: 0,
  keep: 1,
};

class ConfigHandler implements SavedConfigOptions {
  private _sourceFile?: string;
  private _destinationFolder?: string;
  private _projectName?: string;
  private _intervall: number = defaultConfig.intervall;
  private _keep: number = defaultConfig.keep;
  public readonly fileExtension: string = ".emo";
  public readonly version: string = packageJSON.version;
  public readonly isDev: boolean = process.env.NODE_ENV === "development";

  async initialize() {
    await Storage.initialize();
    this.sourceFile =
      (await Storage.getItem("sourceFile")) || defaultConfig.sourceFile;
    this.destinationFolder =
      (await Storage.getItem("destinationFolder")) ||
      defaultConfig.destinationFolder;
    this.projectName =
      (await Storage.getItem("projectName")) || defaultConfig.projectName;
    this.intervall =
      (await Storage.getItem("intervall")) || defaultConfig.intervall;
    this.keep = (await Storage.getItem("keep")) || defaultConfig.keep;
  }

  get sourceFile(): string | undefined {
    return this._sourceFile;
  }

  set sourceFile(value: string | undefined) {
    this._sourceFile = value;

    if (value !== undefined) {
      Storage.setItem("sourceFile", value);
    } else {
      Storage.removeItem("sourceFile");
    }
  }

  get destinationFolder(): string | undefined {
    return this._destinationFolder;
  }

  set destinationFolder(value: string | undefined) {
    this._destinationFolder = value;

    if (value !== undefined) {
      Storage.setItem("destinationFolder", value);
    } else {
      Storage.removeItem("destinationFolder");
    }
  }

  get intervall(): number {
    return this._intervall;
  }

  set intervall(value: number) {
    this._intervall = value;

    if (value !== undefined) {
      Storage.setItem("intervall", value);
    } else {
      Storage.removeItem("intervall");
    }
  }

  get keep(): number {
    return this._keep;
  }

  set keep(value: number) {
    this._keep = value;

    if (value !== undefined) {
      Storage.setItem("keep", value);
    } else {
      Storage.removeItem("keep");
    }
  }

  get projectName(): string | undefined {
    return this._projectName;
  }

  set projectName(value: string | undefined) {
    this._projectName = value;

    if (value !== undefined) {
      Storage.setItem("projectName", value);
    } else {
      Storage.removeItem("projectName");
    }
  }

  isValid(): boolean {
    return (
      Config.sourceFile != undefined &&
      Config.destinationFolder != undefined &&
      Config.projectName != undefined &&
      Config.intervall != undefined &&
      Config.keep != undefined
    );
  }
}

export const Config: ConfigHandler = new ConfigHandler();
