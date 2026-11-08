'use strict';

const { value = 1 } = {};
let { reassigned } = { reassigned: 2 };

function reassign() {
	reassigned += 1;
}

exports.reassign = reassign;
Object.defineProperty(exports, "reassigned", {
	configurable: true,
	enumerable: true,
	get: function () { return reassigned; }
});
exports.value = value;
