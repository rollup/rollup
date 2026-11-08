export const { value = 1 } = {};
export let { reassigned } = { reassigned: 2 };

export function reassign() {
	reassigned += 1;
}
