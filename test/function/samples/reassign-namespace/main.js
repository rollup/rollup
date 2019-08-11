import * as foo from './foo.js';

function reassignFlagX(obj) {
	obj.flags.x = true;
}

reassignFlagX(foo);

foo.test();
