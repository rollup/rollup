import "./dep1.js";
import { element } from "./dep2.js";
import "./dep3.js";

const Foo = () => {};
export const result = <Foo>{'test' + element}</Foo>;
