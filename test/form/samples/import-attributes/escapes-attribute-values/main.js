import { a } from 'a' with { type: "it's" };
export { b } from 'b' with { type: 'back\\slash' };

console.log(a);
import('c', { with: { type: "quote'inside" } });
