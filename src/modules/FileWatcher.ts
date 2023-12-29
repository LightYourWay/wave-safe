import * as chokidar from "chokidar";
import { encodeTimestamp, sanitizeForWindowsFilename } from "./Helpers";
import path from "path";
import fs from "fs-extra";
import { State } from "./State";
import { Tray } from "./Tray";

interface FileWatcherOptions {
  sourceFile: string;
  destinationFolder: string;
  projectName: string;
  intervall: number;
  keep: number;
  fileExtension: string;
}

export class FileWatcher {
  options: FileWatcherOptions;
  private sourceFileWatcher: chokidar.FSWatcher;
  private destinationFolderWatcher: chokidar.FSWatcher;

  constructor(options: FileWatcherOptions) {
    this.options = options;
    const chokidarOptions: chokidar.WatchOptions = {
      usePolling: this.options.intervall != 0,
      binaryInterval:
        this.options.intervall == 0 ? undefined : this.options.intervall * 1000,
    };

    this.sourceFileWatcher = chokidar
      .watch(this.options.sourceFile, chokidarOptions)
      .on("add", () => {
        this.createRollingBackup();
      })
      .on("change", () => {
        this.createRollingBackup();
      })
      .on("unlink", () => {
        Tray.notify("WaveSafe", "STOPPING - Source file went missing!");
        State.stop();
      })
      .on("error", (error) => {
        Tray.notify("WaveSafe", "STOPPING - Source Drive went missing!");
        State.stop();
      });

    this.destinationFolderWatcher = chokidar
      .watch(this.options.destinationFolder)
      .on("unlinkDir", (path) => {
        if (path === this.options.destinationFolder) {
          Tray.notify(
            "WaveSafe",
            "STOPPING - Destination folder went missing!",
          );
          State.stop();
        }
      })
      .on("error", (error) => {
        Tray.notify("WaveSafe", "STOPPING - Destination Drive went missing!");
        State.stop();
      });
  }

  async createRollingBackup() {
    const timestamp = encodeTimestamp(new Date());
    const sanitizedProjectName = sanitizeForWindowsFilename(
      this.options.projectName,
    );
    const filename = `${timestamp}_${sanitizedProjectName}${this.options.fileExtension}`;
    const destinationPath = path.join(
      this.options.destinationFolder,
      sanitizedProjectName,
      filename,
    );

    console.log(`Copying: ${this.options.sourceFile} to ${destinationPath}`);

    // ensure destination folder exists
    const destinationFolder = path.dirname(destinationPath);
    if (!(await fs.exists(destinationFolder))) {
      await fs.mkdir(destinationFolder, { recursive: true });
    }

    // copy file
    await fs.copyFile(this.options.sourceFile, destinationPath);

    // delete old files
    const files = await fs.readdir(destinationFolder);
    files.sort();
    files.reverse();
    for (const file of files.slice(this.options.keep)) {
      const filePath = path.join(destinationFolder, file);
      console.log(`Deleting: ${filePath}`);
      fs.unlink(filePath);
    }
  }

  public stop() {
    this.sourceFileWatcher.close();
    this.destinationFolderWatcher.close();
  }
}
