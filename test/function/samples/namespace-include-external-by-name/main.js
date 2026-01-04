import * as a from './dep.js';

const b = a;

if (!b.fromExternal) {
	throw new Error('External export not included');
}

if (!b.value) {
  throw new Error('Internal export not included');
}
