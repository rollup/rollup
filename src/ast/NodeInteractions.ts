export const INTERACTION_ACCESSED = 0;
export const INTERACTION_ASSIGNED = 1;
export const INTERACTION_CALLED = 2;

export type NodeInteraction =
	| typeof INTERACTION_ACCESSED
	| typeof INTERACTION_ASSIGNED
	| typeof INTERACTION_CALLED;
