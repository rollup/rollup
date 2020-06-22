import { l as lib2 } from './generated-lib2.js';

const lib1 = 'lib1';
console.log(`${lib1} imports ${lib2}`);

export { lib1 as l };
