const condition = globalThis.condition;

function getOptions() {
	if (condition) return { keep: 'first', type: 1 };
	return { keep: 'second', type: 2 };
}

const firstOptions = /* @__PURE__ */ getOptions();
const secondOptions = /* @__PURE__ */ getOptions();

if (firstOptions.keep) {
	assert.equal(firstOptions.type, 2);
} else {
	assert.equal(firstOptions.keep, 'unreachable');
}
if (secondOptions.type) {
	assert.equal(secondOptions.keep, 'second');
} else {
	assert.equal(secondOptions.keep, 'unreachable');
}
