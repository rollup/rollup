import { a } from 'a' with { type: "it's" };
export { b } from 'b' with { type: "back\\slash" };
export { d } from 'd' with { type: "new\nline" };

console.log(a);
import('c', { with: { type: "quote'inside" } });
import('e', { with: { type: "x y" } });
import('f', { with: { type: "double\"quote" } });
