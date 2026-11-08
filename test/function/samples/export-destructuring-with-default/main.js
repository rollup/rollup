export const { retries = 3, timeout = 1000 } = {};
export const [first = 1] = [];
export const { renamed: renamedValue = 2 } = {};
export const {
	nested: { deep = 3 }
} = { nested: {} };
export const { plain } = { plain: 4 };
export let { reassigned } = { reassigned: 5 };

export function bumpReassigned() {
	reassigned += 1;
}

export function setReassigned(value) {
	({ reassigned } = { reassigned: value });
}
