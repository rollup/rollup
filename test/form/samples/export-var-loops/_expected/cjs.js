'use strict';

exports.bodyVar = void 0;
for (const ignored of [1]) exports.bodyVar = 3;

exports.bodyIn = void 0;
for (const key in { a: 1 }) exports.bodyIn = 4;

exports.current = void 0;
for (exports.current of [1]) {
	// nothing
}

exports.inKey = void 0;
for (exports.inKey in { a: 1 }) {
	// nothing
}

exports.index = void 0;
for (exports.index = 0; exports.index < 2; exports.index++) {
	// nothing
}
