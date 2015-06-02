import { sep } from "path";

export function unixizePath(path) {
    if (sep==="/") return path;
    return path.split(sep).join("/");
}
