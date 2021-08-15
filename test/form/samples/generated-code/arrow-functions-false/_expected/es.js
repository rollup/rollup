import { b } from 'external';

let a;

({a} = b);
console.log({a} = b);

export { a };
