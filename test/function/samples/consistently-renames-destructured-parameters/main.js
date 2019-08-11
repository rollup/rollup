import { name } from './module_1.js';

function withoutDefault({ name: name}) {
	return name;
}

function withDefault({ name: name = 10} = {}) {
	return name;
}

function shorthandWithoutDefault({ name}) {
	return name;
}

function shorthandWithDefault({ name = 10 } = {}) {
	return name;
}

assert.equal(name(), 'important to trigger renaming');

assert.equal(withoutDefault({ name: 20 }), 20);
assert.equal(withDefault({ name: 20 }), 20);
assert.equal(withDefault(), 10);

assert.equal(shorthandWithoutDefault({ name: 20 }), 20);
assert.equal(shorthandWithDefault({ name: 20 }), 20);
assert.equal(shorthandWithDefault(), 10);
