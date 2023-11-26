import path from "path";

export function getPath(filepath: string) {
    return path.join(__dirname, process.env.NODE_ENV == "development" ? "../../" : "", filepath)
}