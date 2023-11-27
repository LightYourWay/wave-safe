import fs from "fs";
import fse from "fs-extra";
import * as ResEdit from "resedit";
import inquirer from "inquirer";

console.log(
  "Restoring cached build of node-hide-console-window addon for development...",
);
while (true) {
  try {
    await fse.copy("build/nhcw-dev", "node_modules/node-hide-console-window", {
      overwrite: true,
    });
    break;
  } catch (error) {
    await inquirer
      .prompt([
        {
          type: "confirm",
          name: "retry",
          message:
            "The path `node_modules/node-hide-console-window` is currently blocked. Please stop the the dev environment! Ready to try again?",
          default: true,
        },
      ])
      .then((answers) => {
        if (!answers.retry) {
          process.exit(1);
        }
      });
  }
}

const packageJSON = JSON.parse(fs.readFileSync("package.json"));

const tempPath = "dist/main.exe";
const releasePath = `dist/WaveSafe_v${packageJSON.version}.exe`;

console.log("Reading executable");
let exe = ResEdit.NtExecutable.from(fs.readFileSync(tempPath));

console.log("Reading resources");
let res = ResEdit.NtExecutableResource.from(exe);

console.log("Reading version info");
let viList = ResEdit.Resource.VersionInfo.fromEntries(res.entries);

console.log("Editing version info");
let vi = viList[0];
const theversion = [...packageJSON.version.split("."), 0];

vi.removeStringValue({ lang: 1033, codepage: 1200 }, "OriginalFilename");

vi.removeStringValue({ lang: 1033, codepage: 1200 }, "InternalName");
vi.setProductVersion(
  theversion[0],
  theversion[1],
  theversion[2],
  theversion[3],
  1033,
);
vi.setFileVersion(
  theversion[0],
  theversion[1],
  theversion[2],
  theversion[3],
  1033,
);
vi.setStringValues(
  { lang: 1033, codepage: 1200 },
  {
    FileDescription: `${packageJSON.productName} - Backend`,
    ProductName: packageJSON.productName,
    CompanyName: packageJSON.company,
    LegalCopyright: packageJSON.copyright,
  },
);

console.log("Writing version info");
vi.outputToResourceEntries(res.entries);

console.log("Reading icon file");
let iconFile = ResEdit.Data.IconFile.from(fs.readFileSync("public/app.ico"));
console.log("Replacing icons");
ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
  res.entries,
  1,
  1033,
  iconFile.icons.map((item) => item.data),
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
while (true) {
  try {
    fse.writeFileSync(releasePath, buffer);
    break;
  } catch (error) {
    await inquirer
      .prompt([
        {
          type: "confirm",
          name: "retry",
          message: `The path \`${releasePath}\` is currently blocked. Please stop the the application! Ready to try again?`,
          default: true,
        },
      ])
      .then((answers) => {
        if (!answers.retry) {
          process.exit(1);
        }
      });
  }
}

console.log("Removing temp binary", tempPath);
fse.unlinkSync(tempPath);

console.log("Done");
