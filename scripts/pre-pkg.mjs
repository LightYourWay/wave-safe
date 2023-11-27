import fs from "fs/promises";
import fse from "fs-extra";
import * as ResEdit from "resedit";
import * as childProcess from "child_process";
import inquirer from "inquirer";

const { default: packageJSON } = await import("../package.json", {
  assert: {
    type: "json",
  },
});

if (!fse.existsSync("build/rsrcs")) {
  await fs.mkdir("build/rsrcs");

  const tempPath = "node_modules/trayicon/rsrcs/trayicon.exe";
  const releasePath = "build/rsrcs/trayicon.exe";

  console.log("Reading executable");
  let exe = ResEdit.NtExecutable.from(fse.readFileSync(tempPath), {
    ignoreCert: true,
  });

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
    },
  );

  console.log("Writing version info");
  vi.outputToResourceEntries(res.entries);

  console.log("Reading icon file");
  let iconFile = ResEdit.Data.IconFile.from(fse.readFileSync("public/app.ico"));
  console.log("Replacing icons");
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
    res.entries,
    1,
    0,
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
  fse.writeFileSync(releasePath, buffer);

  console.log("Copying default icon");
  await fs.copyFile(
    "node_modules/trayicon/rsrcs/default.ico",
    "build/rsrcs/default.ico",
  );
} else {
  console.log(
    "TrayIcon binary already exists, skipping copy to build folder...",
  );
}

if (!fse.existsSync("build/nhcw-dev")) {
  console.log(
    "Creating cache of node-hide-console-window addon for development...",
  ); // await fs.mkdir("build/nhcw-pkg");

  await fse.copy("node_modules/node-hide-console-window", "build/nhcw-dev", {
    overwrite: true,
  });
} else {
  console.log(
    "Cache of node-hide-console-window addon for development, skipping copy to build folder...",
  );
}

if (!fse.existsSync("build/nhcw-pkg")) {
  console.log(
    "Creating cache of node-hide-console-window addon for packageing...",
  ); // await fs.mkdir("build/nhcw-pkg");

  await fse.copy("node_modules/node-hide-console-window", "build/nhcw-pkg", {
    overwrite: true,
  });

  console.log("Rebuilding node-hide-console-window for pkg"); // rebuild using node-gyp for node 16, because pkg doesn't support node >16
  childProcess.execSync(
    "node-gyp rebuild --target=16.20.2 --arch=x64 --openssl_fips=''",
    { cwd: "build/nhcw-pkg", stdio: "inherit" },
  );
} else {
  console.log(
    "Cache of node-hide-console-window addon for packageing, skipping rebuild and copy to build folder...",
  );
}

console.log(
  "Using cached build of node-hide-console-window addon for packageing...",
);
while (true) {
  try {
    await fse.copy("build/nhcw-pkg", "node_modules/node-hide-console-window", {
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

console.log("Copying public files");
if (!fse.existsSync("build/public")) {
  await fs.mkdir("build/public");
}

await fs.copyFile("public/idle.png", "build/public/idle.png");

await fs.copyFile("public/inactive.png", "build/public/inactive.png");

await fs.copyFile("public/active.png", "build/public/active.png");

console.log("Copying package.json");
await fs.copyFile("package.json", "build/package.json");

console.log("Done");
