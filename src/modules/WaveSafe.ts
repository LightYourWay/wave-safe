import { Console } from "./Console";
import { Tray } from "./Tray";
import { getUserInput, selectFile, selectFolder } from "./Dialog";
import inquirer from "inquirer";

import { Config } from "./Config";
import { State } from "./State";
import { TrayItems } from "./TrayItems";

class AppHandler {
  async openBackupFolder() {
    TrayItems.backupFolderOpener.checked = false;
    const destinationFolder = Config.destinationFolder;
    if (destinationFolder) {
      Tray.notify("WaveSafe", `Opening Backup Folder: ${destinationFolder}`);
      require("child_process").exec('start "" "' + destinationFolder + '"');
    }
  }

  toggleConsole() {
    Console.visible ? Console.hide() : Console.show();
  }

  async selectSource() {
    await selectFile({
      title: "WaveSafe | Select Source File",
      filter: {
        items: [
          {
            name: "Waves LV1 Backup File",
            extension: "*.dat",
          },
        ],
        index: 0,
      },
      initialDirectory: Config.sourceFile,
      restoreDirectory: Config.sourceFile ? false : true,
    })
      .then((filePath) => {
        if (filePath) {
          Config.sourceFile = filePath.toString();
          TrayItems.sourceSelector.label = `Selected Source: ${filePath.toString()}`;
          TrayItems.sourceSelector.bold = false;
          TrayItems.sourceSelector.checked = true;

          State.configure();
        }
      })
      .catch((err) => {
        TrayItems.sourceSelector.checked = Config.sourceFile ? true : false;
      });
  }

  async selectDestination() {
    await selectFolder({
      title: "WaveSafe | Select Destination Folder",
      initialDirectory: Config.destinationFolder,
    })
      .then((folderPath) => {
        if (folderPath) {
          Config.destinationFolder = folderPath.toString();
          TrayItems.destinationSelector.label = `Selected Destination: ${folderPath.toString()}`;
          TrayItems.destinationSelector.bold = false;
          TrayItems.destinationSelector.checked = true;
          TrayItems.backupFolderOpener.disabled = false;
          TrayItems.nameSelector.disabled = false;
          if (!Config.projectName) TrayItems.nameSelector.bold = true;

          State.configure();
        }
      })
      .catch((err) => {
        TrayItems.destinationSelector.checked = Config.destinationFolder
          ? true
          : false;
      });
  }

  async setProjectName() {
    await getUserInput({
      title: "WaveSafe | Set Project Name",
      message: "Please enter a new project name:",
      initialValue: Config.projectName,
    })
      .then((input) => {
        if (input) {
          Config.projectName = input;
          TrayItems.nameSelector.label = `Project Name: ${input}`;
          TrayItems.nameSelector.bold = false;
          TrayItems.nameSelector.checked = true;

          State.configure();
        }
      })
      .catch((err) => {
        TrayItems.nameSelector.checked = Config.projectName ? true : false;
      });
  }

  async toggleActivation() {
    State.running ? await State.stop() : await State.start();
    console.log(`State: ${State.running ? "running" : "stopped"}`);
  }
}

export const WaveSafe = new AppHandler();
