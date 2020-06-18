import { l as lib1 } from './generated-lib1.js';

const lib2 = 'lib2';
console.log(`${lib2} imports ${lib1}`);

export { lib2 as l };
