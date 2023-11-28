import fs from "fs/promises";
import { getPath } from "./Helpers";
import { Backend } from "./Backend";
import { Frontend } from "./Frontend";
import { selectFile } from "./PathPicker";
import { storage } from "./Storage";
import { TrayItemSingle } from "./TrayItemSingle";
import { TrayItemSeparator } from "./TrayItemSeparator";
import { TrayItemMulti } from "./TrayItemMulti";
import inquirer from "inquirer";

interface WaveSafeOptions {
  initialSourceFile?: string;
  initialDestinationFolder?: string;
  initialIntervall?: number;
  initialKeep?: number;
  initialProjectName?: string;
}

export class WaveSafe {
  frontend: Frontend;
  backend: Backend;
  activated = false;

  private options: WaveSafeOptions;

  private sourceSelector: TrayItemSingle;
  private destinationSelector: TrayItemSingle;
  private nameSelector: TrayItemSingle;
  private intervallSelector: TrayItemMulti;
  private keepSelector: TrayItemMulti;
  private activationToggle: TrayItemSingle;
  private backupFolderOpener: TrayItemSingle;
  private consoleToggle: TrayItemSingle;

  constructor(backend: Backend, frontend: Frontend, options?: WaveSafeOptions) {
    this.frontend = frontend;
    this.backend = backend;
    this.options = options || {};

    this.sourceSelector = new TrayItemSingle(this.frontend, {
      label: this.options.initialSourceFile
        ? `Selected Source: ${this.options.initialSourceFile}`
        : "Select Source",
      checked: this.options.initialSourceFile ? true : false,
      bold: this.options.initialSourceFile ? false : true,
      action: () => this.selectSource(),
    });
    this.frontend.registerItem(this.sourceSelector);

    this.destinationSelector = new TrayItemSingle(this.frontend, {
      label: this.options.initialDestinationFolder
        ? `Selected Destination: ${this.options.initialDestinationFolder}`
        : "Select Destination",
      checked: this.options.initialDestinationFolder ? true : false,
      bold: this.options.initialDestinationFolder ? false : true,
      action: () => this.selectDestination(),
    });
    this.frontend.registerItem(this.destinationSelector);

    this.nameSelector = new TrayItemSingle(this.frontend, {
      label: this.options.initialProjectName
        ? `Project Name: ${this.options.initialProjectName}`
        : "Project Name",
      checked: this.options.initialProjectName ? true : false,
      disabled: this.options.initialDestinationFolder ? false : true,
      bold: this.options.initialProjectName ? false : true,
      action: () => this.setProjectName(),
    });
    this.frontend.registerItem(this.nameSelector);

    this.frontend.registerItem(new TrayItemSeparator(this.frontend));

    this.intervallSelector = new TrayItemMulti(this.frontend, {
      label: "Intervall",
      options: [
        new TrayItemSingle(this.frontend, {
          label: "onChange",
          value: 0,
        }),
        new TrayItemSingle(this.frontend, {
          label: "30 sec",
          value: 30,
        }),
        new TrayItemSingle(this.frontend, {
          label: "1 min",
          value: 60,
        }),
        new TrayItemSingle(this.frontend, {
          label: "2 min",
          value: 120,
        }),
      ],
      initialOption: this.options.initialIntervall
        ? this.options.initialIntervall
        : 0,
    });
    this.frontend.registerItem(this.intervallSelector);

    this.keepSelector = new TrayItemMulti(this.frontend, {
      label: "Keep",
      options: [
        new TrayItemSingle(this.frontend, {
          label: "10 Backups",
          value: 10,
        }),
        new TrayItemSingle(this.frontend, {
          label: "25 Backups",
          value: 25,
        }),
        new TrayItemSingle(this.frontend, {
          label: "50 Backups",
          value: 50,
        }),
        new TrayItemSingle(this.frontend, {
          label: "100 Backups",
          value: 100,
        }),
      ],
      initialOption: this.options.initialKeep ? this.options.initialKeep : 1,
    });
    this.frontend.registerItem(this.keepSelector);

    this.backupFolderOpener = new TrayItemSingle(this.frontend, {
      label: "Open Backup Folder",
      checked: false,
      disabled: this.options.initialDestinationFolder ? false : true,
      action: () => this.openBackupFolder(),
    });
    this.frontend.registerItem(this.backupFolderOpener);

    this.consoleToggle = new TrayItemSingle(this.frontend, {
      label: "Show Console",
      checked: false,
      action: () => this.toggleConsole(),
    });
    if (process.env.NODE_ENV != "development")
      this.frontend.registerItem(this.consoleToggle);

    this.frontend.registerItem(new TrayItemSeparator(this.frontend));

    this.activationToggle = new TrayItemSingle(this.frontend, {
      label: "Start",
      checked: false,
      bold: true,
      disabled: this.initializedReady() ? false : true,
      action: () => this.toggleActivation(),
    });
    this.frontend.registerItem(this.activationToggle);
  }

  initializedReady() {
    return (
      this.options.initialSourceFile != undefined &&
      this.options.initialDestinationFolder != undefined &&
      this.options.initialProjectName != undefined &&
      this.options.initialIntervall != undefined &&
      this.options.initialKeep != undefined
    );
  }

  async updateStartButtonState() {
    if (await this.readyState()) {
      this.activationToggle.disabled = false;
    }
  }

  async readyState() {
    return (
      (await storage.getItem("sourceFile")) != undefined &&
      (await storage.getItem("destinationFolder")) != undefined &&
      (await storage.getItem("project_name")) != undefined &&
      (await storage.getItem("intervall")) != undefined &&
      (await storage.getItem("keep")) != undefined
    );
  }

  async openBackupFolder() {
    this.backupFolderOpener.checked = false;
    const destinationFolder = await storage.getItem("destinationFolder");
    if (destinationFolder) {
      this.frontend.tray.notify(
        "WaveSafe",
        `Opening Backup Folder: ${destinationFolder}`,
      );
      require("child_process").exec('start "" "' + destinationFolder + '"');
    }
  }

  async setProjectName() {
    this.showConsole();

    await inquirer
      .prompt([
        {
          type: "input",
          name: "projectName",
          message: `Please enter a Project Name:`,
        },
      ])
      .then((answers) => {
        if (answers.projectName) {
          this.hideConsole();
          storage.setItem("project_name", answers.projectName);
          this.nameSelector.label = `Project Name: ${answers.projectName}`;
          this.nameSelector.bold = false;
          this.nameSelector.checked = true;

          this.updateStartButtonState();
        }
      });
  }

  toggleConsole() {
    this.backend.visible ? this.hideConsole() : this.showConsole();
  }

  hideConsole() {
    this.backend.hide();
    this.consoleToggle.checked = false;
  }

  showConsole() {
    this.backend.show();
    this.consoleToggle.checked = true;
  }

  async selectSource() {
    const filePath = await selectFile({
      title: "Select Source File",
      filter: {
        items: [
          {
            name: "Waves LV1 Backup File",
            extension: "*.dat",
          },
        ],
        index: 1,
      },
    }).catch(async (err) => {
      this.sourceSelector.checked = (await storage.getItem("sourceFile"))
        ? true
        : false;
    });
    if (filePath) {
      storage.setItem("sourceFile", filePath.toString());
      this.sourceSelector.label = `Selected Source: ${filePath.toString()}`;
      this.sourceSelector.bold = false;
      this.sourceSelector.checked = true;

      await this.updateStartButtonState();
    }
  }

  async selectDestination() {
    const folderPath = await selectFile({
      title: "Select Destination Folder",
      filter: {
        items: [
          {
            name: "Folder",
            extension: "*",
          },
        ],
        index: 1,
      },
    }).catch(async (err) => {
      this.destinationSelector.checked = (await storage.getItem(
        "destinationFolder",
      ))
        ? true
        : false;
    });
    if (folderPath) {
      storage.setItem("destinationFolder", folderPath.toString());
      this.destinationSelector.label = `Selected Destination: ${folderPath.toString()}`;
      this.destinationSelector.bold = false;
      this.destinationSelector.checked = true;
      this.nameSelector.disabled = false;
      this.nameSelector.bold = true;

      await this.updateStartButtonState();
    }
  }

  async toggleActivation() {
    if (!(await this.readyState())) {
      this.frontend.tray.notify(
        "WaveSafe",
        "NOT READY - Please configure first!",
      );
      return;
    }

    this.activated ? await this.deactivate() : await this.activate();
    console.log(`State: ${this.activated ? "running" : "stopped"}`);
  }

  async activate() {
    this.frontend.tray.setIcon(await fs.readFile(getPath("public/active.png")));
    this.frontend.tray.notify("WaveSafe", "RUNNING");
    this.activationToggle.label = "Stop";
    this.activated = true;
  }

  async deactivate() {
    this.frontend.tray.setIcon(
      await fs.readFile(getPath("public/inactive.png")),
    );
    this.frontend.tray.notify("WaveSafe", "STOPPED");
    this.activationToggle.label = "Start";
    this.activated = false;
  }
}
