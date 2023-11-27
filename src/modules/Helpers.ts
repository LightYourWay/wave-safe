import path from "path";
var asciify = require("asciify-image");

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
