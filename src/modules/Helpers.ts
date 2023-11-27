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
