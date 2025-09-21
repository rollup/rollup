import { s as square } from './generated-square.js';

const cube = x => square(x) * x;

export { cube, square };
