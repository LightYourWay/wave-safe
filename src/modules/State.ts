import { config } from "process";
import { Config } from "./Config";
import { Console } from "./Console";
import { FileWatcher } from "./FileWatcher";
import { getImageAsAscii, getPath, isAlreadyRunning, timeout } from "./Helpers";
import { Tray } from "./Tray";
import { TrayItems } from "./TrayItems";
import { WaveSafe } from "./WaveSafe";
import fs from "fs/promises";

interface AppOperations {
  initialize(): Promise<AppState>;
  configure(): Promise<AppState>;
  start(): Promise<AppState>;
  stop(): Promise<AppState>;
}

export class AppStateHandler implements AppOperations {
  private _state: AppState = new ClosedState();
  get initialized() {
    return !(this._state instanceof ClosedState);
  }
  get running() {
    return this._state instanceof RunningState;
  }

  public async initialize(): Promise<AppState> {
    this._state = await this._state.initialize();
    return this._state;
  }

  public async configure(): Promise<AppState> {
    this._state = await this._state.configure();
    return this._state;
  }

  public async start(): Promise<AppState> {
    this._state = await this._state.start();
    return this._state;
  }

  public async stop(): Promise<AppState> {
    this._state = await this._state.stop();
    return this._state;
  }
}

abstract class AppState implements AppOperations {
  public async initialize(): Promise<AppState> {
    console.log("Cannot initialize from this state");
    return this;
  }

  public async configure(): Promise<AppState> {
    console.log("Cannot configure from this state");
    return this;
  }
  public async start(): Promise<AppState> {
    console.log("Cannot start from this state");
    return this;
  }
  public async stop(): Promise<AppState> {
    console.log("Cannot stop from this state");
    return this;
  }
}

class ClosedState extends AppState {
  constructor() {
    super();
  }

  async initialize(): Promise<AppState> {
    console.log("Initializing");

    if (!Config.isDev) {
      console.log("Checking if already running...");
      if (await isAlreadyRunning()) {
        console.log("Already running! Exiting...");
        await timeout(1000);
        process.exit(1);
      }
    }

    console.log("Starting WaveSafe...");

    if (!Config.isDev) {
      console.log(
        await getImageAsAscii(getPath("public/idle.png"), {
          width: 28,
          height: 28,
        }),
      );
      await timeout(200);
    }

    console.log(`WaveSafe version ${Config.version} started!`);

    if (!Config.isDev) await timeout(1000);

    Console.hide();

    await Tray.initialize({
      title: `WaveSafe v${Config.version}`,
      iconPath: getPath("public/idle.png"),
      action: () => WaveSafe.toggleActivation(), // TODO: toogle activation
      useTempDir: true,
    });

    return new InitializedState();
  }
}

class InitializedState extends AppState {
  constructor() {
    super();

    Tray.redraw();
  }

  async configure(): Promise<AppState> {
    console.log("Configuring");

    if (Config.isValid()) {
      console.log("Config is valid!");
      TrayItems.activationToggle.disabled = false;
      return new ConfiguredState();
    }

    console.log("Config is not valid!");
    return this;
  }
}

class ConfiguredState extends AppState {
  constructor() {
    super();
  }

  async start(): Promise<AppState> {
    if (!Config.isValid()) {
      Tray.notify("WaveSafe", "NOT READY - Please configure first!");

      console.log("Config is not valid!");
      TrayItems.activationToggle.checked = false;
      return this;
    }

    // check if source file exists, notify user if not and returning this
    if (!(await fs.stat(Config.sourceFile!).catch(() => false))) {
      Tray.notify("WaveSafe", "NOT READY - Source file was not found!");

      console.log("Source file was not found - please check!");
      TrayItems.activationToggle.checked = false;
      return this;
    }

    // check if destination folder exists, notify user if not and returning this
    if (!(await fs.stat(Config.destinationFolder!).catch(() => false))) {
      Tray.notify("WaveSafe", "NOT READY - Destination folder was not found!");

      console.log("Destination was not found - please check!");
      TrayItems.activationToggle.checked = false;
      return this;
    }

    console.log("Starting");

    // disable user input
    TrayItems.sourceSelector.disabled = true;
    TrayItems.destinationSelector.disabled = true;
    TrayItems.nameSelector.disabled = true;
    TrayItems.intervallSelector.disabled = true;
    TrayItems.keepSelector.disabled = true;

    // update tray icon and notify user
    Tray.setIcon(await fs.readFile(getPath("public/active.png")));
    Tray.notify("WaveSafe", "RUNNING");
    TrayItems.activationToggle.label = "Stop";

    return new RunningState();
  }
}

export class RunningState extends AppState {
  public fileWatcher: FileWatcher;

  constructor() {
    super();

    // start file watcher
    this.fileWatcher = new FileWatcher({
      sourceFile: Config.sourceFile!,
      destinationFolder: Config.destinationFolder!,
      projectName: Config.projectName!,
      intervall: TrayItems.intervallSelector.selects[Config.intervall].value,
      keep: TrayItems.keepSelector.selects[Config.keep].value,
      fileExtension: Config.fileExtension,
    });
  }

  async stop(): Promise<AppState> {
    console.log("Stopping");

    // stop file watcher
    this.fileWatcher.stop();

    // enable user input
    TrayItems.sourceSelector.disabled = false;
    TrayItems.destinationSelector.disabled = false;
    TrayItems.nameSelector.disabled = false;
    TrayItems.intervallSelector.disabled = false;
    TrayItems.keepSelector.disabled = false;

    // update tray icon and notify user
    Tray.setIcon(await fs.readFile(getPath("public/inactive.png")));
    Tray.notify("WaveSafe", "STOPPED");
    TrayItems.activationToggle.label = "Start";

    return new ConfiguredState();
  }
}

export const State = new AppStateHandler();
