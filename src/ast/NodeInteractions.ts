import type SpreadElement from './nodes/SpreadElement';
import type { ExpressionEntity } from './nodes/shared/Expression';
import { UNKNOWN_EXPRESSION } from './nodes/shared/Expression';

export const INTERACTION_ACCESSED = 0;
export const INTERACTION_ASSIGNED = 1;
export const INTERACTION_CALLED = 2;

// The first argument is the "this" context
export interface NodeInteractionAccessed {
	args: readonly [ExpressionEntity | null];
	type: typeof INTERACTION_ACCESSED;
}

export const NODE_INTERACTION_UNKNOWN_ACCESS: NodeInteractionAccessed = {
	args: [null],
	type: INTERACTION_ACCESSED
};

// The first argument is the "this" context, the second argument the assigned expression
export interface NodeInteractionAssigned {
	args: readonly [ExpressionEntity | null, ExpressionEntity];
	type: typeof INTERACTION_ASSIGNED;
}

export const NODE_INTERACTION_UNKNOWN_ASSIGNMENT: NodeInteractionAssigned = {
	args: [null, UNKNOWN_EXPRESSION],
	type: INTERACTION_ASSIGNED
};

// The first argument is the "this" context, the other arguments are the actual arguments
export interface NodeInteractionCalled {
	args: readonly [ExpressionEntity | null, ...(ExpressionEntity | SpreadElement)[]];
	type: typeof INTERACTION_CALLED;
	withNew: boolean;
}

// While this is technically a call without arguments, we can compare against
// this reference in places where precise values or this argument would make a
// difference
export const NODE_INTERACTION_UNKNOWN_CALL: NodeInteractionCalled = {
	args: [null],
	type: INTERACTION_CALLED,
	withNew: false
};

// For tracking, interactions are uniquely determined by their .args
export type NodeInteraction =
	| NodeInteractionAccessed
	| NodeInteractionAssigned
	| NodeInteractionCalled;
