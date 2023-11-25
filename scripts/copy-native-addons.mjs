import fs from "fs/promises";
import fsSync from "fs";

if (!fsSync.existsSync("build/rsrcs")) {
  await fs.mkdir("build/rsrcs");
}
await fs.copyFile(
  "node_modules/trayicon/rsrcs/trayicon.exe",
  "build/rsrcs/trayicon.exe",
);
await fs.copyFile(
  "node_modules/trayicon/rsrcs/default.ico",
  "build/rsrcs/default.ico",
);
