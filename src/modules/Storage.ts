import path from "path";

export const Storage = require("node-persist");

Storage.initialize = async function (): Promise<void> {
  await Storage.init({
    dir: path.join(
      process.env.APPDATA ||
        (process.platform == "darwin"
          ? process.env.HOME + "/Library/Preferences"
          : process.env.HOME + "/.local/share"),
      "WaveSafe",
    ),
  });
};
