import { CallOptions } from './CallOptions';

export const INTERACTION_ACCESSED = 0;
export const INTERACTION_ASSIGNED = 1;
export const INTERACTION_CALLED = 2;

export interface NodeInteractionAccessed {
	type: typeof INTERACTION_ACCESSED;
}

interface NodeInteractionAssigned {
	type: typeof INTERACTION_ASSIGNED;
}

// TODO Lukas call options should be flattened into this one
interface NodeInteractionCalled {
	callOptions: CallOptions;
	type: typeof INTERACTION_CALLED;
}

export type NodeInteraction =
	| NodeInteractionAccessed
	| NodeInteractionAssigned
	| NodeInteractionCalled;
