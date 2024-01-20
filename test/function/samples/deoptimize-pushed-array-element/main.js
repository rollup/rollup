let mutated = false;
const stack = [];
const state = {
	foo: undefined
};
stack.push(state);
stack.at(-1).foo = () => (mutated = true);

state.foo?.();

assert.ok(mutated);
