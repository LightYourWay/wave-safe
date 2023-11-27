import path from "path";

export const storage = require('node-persist');

export async function initStorage() {
    await storage.init({
        dir: path.join(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"), "WaveSafe")
    });
}