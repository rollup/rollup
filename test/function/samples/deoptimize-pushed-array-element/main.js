let mutated1 = false;
const state1 = {
	foo: undefined
};

let mutated2 = false;
const state2 = {
	foo: undefined
};

const stack = [];
stack.push(state1, state2);
stack[0].foo = () => (mutated1 = true);
stack.at(-1).foo = () => (mutated2 = true);

state1.foo?.();
assert.ok(mutated1, '1');

state2.foo?.();
assert.ok(mutated2, '2');

