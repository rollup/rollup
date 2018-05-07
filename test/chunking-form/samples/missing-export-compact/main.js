import d1f1, { d1f2 } from './d1';
import d1f3, * as d1 from './d1';

import d2f1, { d2f2 } from './d2';
import d2f3, * as d2 from './d2';

d1f1();
d1f2();
d1f3();
d1.f4();

d2f1();
d2f2();
d2f3();
d2.f4();

export { default, default as d3f1, d3f2 } from './d3';
export * from './d3';

export const $$shim$2 = null;