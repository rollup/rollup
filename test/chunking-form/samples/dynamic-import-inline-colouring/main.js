import foo from "./foo.js";

const unused = () => import("./foo.js");

export default () => foo;