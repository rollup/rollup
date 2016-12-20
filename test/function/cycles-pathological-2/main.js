import { b, bv } from './b';
import { d, dv } from './d';
import { c, cv } from './c';

export function a() {
    b(bv);
    d(dv);
    c(cv);
};

export const av = bv + dv + cv;
