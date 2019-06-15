import * as ns from './namespace';

const unneeded1 = 1;

ns.noParams(unneeded1);

const unneeded2 = 1;

const needed21 = 1;
const needed22 = 2;
const needed23 = 3;

ns.someUsedParams(needed21, needed22, needed23, unneeded2);
