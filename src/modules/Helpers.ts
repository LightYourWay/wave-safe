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

export function encodeTimestamp(timestamp: Date): string {
  const now = new Date();

  const year = now.getFullYear().toString().substr(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const milliseconds = now.getMilliseconds().toString().padStart(3, "0");

  return `${year}${month}${day}-${hours}${minutes}${seconds}${milliseconds}`;
}

export function decodeTimestamp(timestamp: string): Date {
  const regex = /^(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})(\d{3})$/;
  const match = timestamp.match(regex);

  if (match) {
    const year = parseInt(match[1], 10) + 2000; // Adjust based on century assumption
    const month = parseInt(match[2], 10) - 1; // Months are 0-indexed in JavaScript
    const day = parseInt(match[3], 10);
    const hours = parseInt(match[4], 10);
    const minutes = parseInt(match[5], 10);
    const seconds = parseInt(match[6], 10);
    const milliseconds = parseInt(match[7], 10);

    return new Date(year, month, day, hours, minutes, seconds, milliseconds);
  }

  throw new Error(`Invalid timestamp: ${timestamp}`);
}

export function sanitizeForWindowsFilename(input: string): string {
  // Replace spaces with dashes
  let sanitized = input.replace(/ /g, "-");

  // Remove forbidden characters
  sanitized = sanitized.replace(/[<>:"\/\\|?*]/g, "");

  // Trim trailing dashes and periods (since they can't be at the end of Windows filenames)
  sanitized = sanitized.replace(/[-.]+$/, "");

  return sanitized;
}

export function camelize(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}
