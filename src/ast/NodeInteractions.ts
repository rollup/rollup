import type SpreadElement from './nodes/SpreadElement';
import type { ExpressionEntity } from './nodes/shared/Expression';
import { UNKNOWN_EXPRESSION } from './nodes/shared/Expression';

export const INTERACTION_ACCESSED = 0;
export const INTERACTION_ASSIGNED = 1;
export const INTERACTION_CALLED = 2;

export interface NodeInteractionAccessed {
	args: null;
	thisArg: ExpressionEntity | null;
	type: typeof INTERACTION_ACCESSED;
}

export const NODE_INTERACTION_UNKNOWN_ACCESS: NodeInteractionAccessed = {
	args: null,
	thisArg: null,
	type: INTERACTION_ACCESSED
};

export interface NodeInteractionAssigned {
	args: readonly [ExpressionEntity];
	thisArg: ExpressionEntity | null;
	type: typeof INTERACTION_ASSIGNED;
}

export const UNKNOWN_ARG = [UNKNOWN_EXPRESSION] as const;

export const NODE_INTERACTION_UNKNOWN_ASSIGNMENT: NodeInteractionAssigned = {
	args: UNKNOWN_ARG,
	thisArg: null,
	type: INTERACTION_ASSIGNED
};

export interface NodeInteractionCalled {
	args: readonly (ExpressionEntity | SpreadElement)[];
	thisArg: ExpressionEntity | null;
	type: typeof INTERACTION_CALLED;
	withNew: boolean;
}

export const NO_ARGS = [];

// While this is technically a call without arguments, we can compare against
// this reference in places where precise values or thisArg would make a
// difference
export const NODE_INTERACTION_UNKNOWN_CALL: NodeInteractionCalled = {
	args: NO_ARGS,
	thisArg: null,
	type: INTERACTION_CALLED,
	withNew: false
};

// For tracking, called and assigned are uniquely determined by their .args
// while accessed is determined by .thisArg
export type NodeInteraction =
	| NodeInteractionAccessed
	| NodeInteractionAssigned
	| NodeInteractionCalled;
