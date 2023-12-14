import { Config } from "./Config";
import { TrayItemMulti } from "./TrayItemMulti";
import { TrayItemSeparator } from "./TrayItemSeparator";
import { TrayItemSingle } from "./TrayItemSingle";
import { WaveSafe } from "./WaveSafe";

export const TrayItems = {
  version: new TrayItemSingle({
    label: `WaveSafe v${Config.version}`,
    disabled: true,
    bold: true,
  }),
  separator1: new TrayItemSeparator(),
  sourceSelector: new TrayItemSingle({
    label: Config.sourceFile
      ? `Selected Source: ${Config.sourceFile}`
      : "Select Source",
    checked: Config.sourceFile ? true : false,
    bold: Config.sourceFile ? false : true,
    action: () => WaveSafe.selectSource(),
  }),
  destinationSelector: new TrayItemSingle({
    label: Config.destinationFolder
      ? `Selected Destination: ${Config.destinationFolder}`
      : "Select Destination",
    checked: Config.destinationFolder ? true : false,
    bold: Config.destinationFolder ? false : true,
    action: () => WaveSafe.selectDestination(),
  }),
  nameSelector: new TrayItemSingle({
    label: Config.projectName
      ? `Project Name: ${Config.projectName}`
      : "Project Name",
    checked: Config.projectName ? true : false,
    disabled: Config.projectName ? false : true,
    bold: Config.projectName ? false : true,
    action: () => WaveSafe.setProjectName(),
  }),
  separator2: new TrayItemSeparator(),
  intervallSelector: new TrayItemMulti({
    label: "Intervall",
    selects: [
      new TrayItemSingle({
        label: "onChange",
        value: 0,
      }),
      new TrayItemSingle({
        label: "30 sec",
        value: 30,
      }),
      new TrayItemSingle({
        label: "1 min",
        value: 60,
      }),
      new TrayItemSingle({
        label: "2 min",
        value: 120,
      }),
    ],
    initialOption: Config.intervall,
  }),
  keepSelector: new TrayItemMulti({
    label: "Keep",
    selects: [
      new TrayItemSingle({
        label: "10 Backups",
        value: 10,
      }),
      new TrayItemSingle({
        label: "25 Backups",
        value: 25,
      }),
      new TrayItemSingle({
        label: "50 Backups",
        value: 50,
      }),
      new TrayItemSingle({
        label: "100 Backups",
        value: 100,
      }),
    ],
    initialOption: Config.keep,
  }),
  backupFolderOpener: new TrayItemSingle({
    label: "Open Backup Folder",
    checked: false,
    disabled: Config.destinationFolder ? false : true,
    action: () => WaveSafe.openBackupFolder(),
  }),
  consoleToggle: new TrayItemSingle({
    label: "Show Console",
    checked: false,
    action: () => WaveSafe.toggleConsole(),
  }),
  separator3: new TrayItemSeparator(),
  activationToggle: new TrayItemSingle({
    label: "Start",
    checked: false,
    bold: true,
    disabled: Config.isValid() ? false : true,
    action: () => WaveSafe.toggleActivation(),
  }),
} as const;
