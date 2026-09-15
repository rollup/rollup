import { TABLE } from './constants.js';
import { createThing } from './loader.js';

const thing = createThing(globalThis.asyncThing);
await thing.setup(TABLE);
