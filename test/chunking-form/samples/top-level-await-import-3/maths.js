import square from './square.js';

export { default as square } from './square.js';

export const cube = x => square(x) * x;
