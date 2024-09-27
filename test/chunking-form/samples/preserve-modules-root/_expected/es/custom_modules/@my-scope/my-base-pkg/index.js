import { __exports as myBasePkg } from '../../../_virtual/index.js';

var hasRequiredMyBasePkg;

function requireMyBasePkg () {
	if (hasRequiredMyBasePkg) return myBasePkg;
	hasRequiredMyBasePkg = 1;

	Object.defineProperty(myBasePkg, '__esModule', { value: true });

	var hello = 'world';

	myBasePkg.hello = hello;
	return myBasePkg;
}

export { requireMyBasePkg as __require };
