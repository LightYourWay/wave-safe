import { IFilterItem } from "../interfaces/IDialog";
import path from "path";
var asciify = require("asciify-image");
var ps = require("ps-node");

export async function timeout(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getPath(filepath: string) {
  return path.join(
    __dirname,
    process.env.NODE_ENV == "development" ? "../../" : "",
    filepath,
  );
}

export function getImageAsAscii(
  filepath: string,
  { width, height }: { width: number; height: number },
) {
  return new Promise((resolve, reject) => {
    asciify(filepath, {
      fit: "none",
      width: width,
      height: height,
    })
      .then(function (asciified: string) {
        resolve(asciified);
      })
      .catch(function (err: any) {
        reject(err);
      });
  });
}

export async function isAlreadyRunning() {
  return new Promise((resolve, reject) => {
    ps.lookup(
      {
        command: "WaveSafe",
        arguments: "",
      },
      function (err: any, resultList: any) {
        if (err) {
          reject(err);
        }
        let count = 0;
        resultList.forEach(function (process: any) {
          if (process) {
            count++;
          }
        });
        resolve(count > 1);
      },
    );
  });
}

export function filterToString(filter: IFilterItem[]) {
  let filterString = "";
  filter.forEach((item) => {
    filterString += `${item.name}|${item.extension}|`;
  });
  filterString = filterString.slice(0, -1);
  return filterString;
}

export function psSpawner(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    var spawn = require("child_process").spawn,
      child: any;
    child = spawn("powershell.exe", [command]);
    child.stdout.on("data", function (data: any) {
      resolve(data.toString());
    });
    child.stderr.on("data", function (data: any) {
      reject(data.toString());
    });
    child.stdin.end();
  });
}
