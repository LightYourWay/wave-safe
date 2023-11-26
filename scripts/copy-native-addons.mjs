import fs from "fs/promises";
import fsSync from "fs";
import * as ResEdit from "resedit";

const packageJSON = JSON.parse(fsSync.readFileSync("package.json"));

const tempPath = "node_modules/trayicon/rsrcs/trayicon.exe";
const releasePath = "build/rsrcs/trayicon.exe";

if (!fsSync.existsSync("build/rsrcs")) {
  await fs.mkdir("build/rsrcs");
}

console.log("Reading executable");
let exe = ResEdit.NtExecutable.from(fsSync.readFileSync(tempPath), { ignoreCert: true });

console.log("Reading resources");
let res = ResEdit.NtExecutableResource.from(exe);

console.log("Reading version info");
let viList = ResEdit.Resource.VersionInfo.fromEntries(res.entries);

console.log("Editing version info");
let vi = viList[0];
const theversion = [...packageJSON.version.split("."), 0];

vi.removeStringValue({ lang: 0, codepage: 1200 }, "OriginalFilename");

vi.removeStringValue({ lang: 0, codepage: 1200 }, "InternalName");

vi.setStringValues(
    { lang: 0, codepage: 1200 },
    {
        FileDescription: `${packageJSON.productName} - Frontend`,
        ProductName: packageJSON.productName,
        CompanyName: packageJSON.company,
        LegalCopyright: packageJSON.copyright,
    }
);

console.log("Writing version info");
vi.outputToResourceEntries(res.entries);

console.log("Reading icon file");
let iconFile = ResEdit.Data.IconFile.from(
    fsSync.readFileSync("public/app.ico")
);
console.log("Replacing icons");
ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
    res.entries,
    1,
    0,
    iconFile.icons.map((item) => item.data)
);

console.log("Writing resources");
res.outputResource(exe);

console.log("Generating new binary");
const newBinary = exe.generate();
const buffer = Buffer.from(newBinary);
if (buffer.length === 0) {
    throw new Error("Failed to generate new binary. Buffer is empty.");
}

console.log("Writing new binary to", releasePath);
fsSync.writeFileSync(releasePath, buffer);

console.log("Copying default icon");
await fs.copyFile(
  "node_modules/trayicon/rsrcs/default.ico",
  "build/rsrcs/default.ico",
);

console.log("Copying public files");
if (!fsSync.existsSync("build/public")) {
  await fs.mkdir("build/public");
}

await fs.copyFile(
  "public/idle.png",
  "build/public/idle.png",
);

await fs.copyFile(
  "public/inactive.png",
  "build/public/inactive.png",
);

await fs.copyFile(
  "public/active.png",
  "build/public/active.png",
);

console.log("Done");