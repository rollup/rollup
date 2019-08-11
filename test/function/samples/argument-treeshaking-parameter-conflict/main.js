import * as dep from './dep';

function test(mutate) {
	dep.mutate('hello');
}

test();

assert.strictEqual(dep.value, 1);
