const key = 'computed';

export const { retries = 3, timeout = 1000 } = {};
export const [first = 1] = [];
export const { renamed: renamedValue = 2 } = {};
export const {
	nested: { deep = 3 }
} = { nested: {} };
export const { plain } = { plain: 4 };
export const { [key]: computed = 5 } = {};
export let [...rest] = [6, 7, 8];
export let { reassigned } = { reassigned: 5 };
export let { counter = 0 } = {};
export let { looped = 0 } = {};

export function bumpReassigned() {
	reassigned += 1;
}

export function setReassigned(value) {
	({ reassigned } = { reassigned: value });
}

export function incrementCounter() {
	counter++;
}

export function loop() {
	for (looped of [1, 2]) {
		// reassign through a for-of target
	}
}

export function resetRest() {
	rest = [];
}
