import SpreadElement from './nodes/SpreadElement';
import { ExpressionEntity, UNKNOWN_EXPRESSION } from './nodes/shared/Expression';

// TODO Lukas for usages and see if caching makes sense
export const INTERACTION_ACCESSED = 0;
export const INTERACTION_ASSIGNED = 1;
export const INTERACTION_CALLED = 2;

export interface NodeInteractionAccessed {
	thisArg: ExpressionEntity | null;
	type: typeof INTERACTION_ACCESSED;
}

export const NODE_INTERACTION_ACCESS: NodeInteractionAccessed = {
	thisArg: null,
	type: INTERACTION_ACCESSED
};

export interface NodeInteractionAssigned {
	thisArg: ExpressionEntity | null;
	type: typeof INTERACTION_ASSIGNED;
	value: ExpressionEntity;
}

export const NODE_INTERACTION_UNKNOWN_ASSIGNMENT: NodeInteractionAssigned = {
	thisArg: null,
	type: INTERACTION_ASSIGNED,
	value: UNKNOWN_EXPRESSION
};

export interface NodeInteractionCalled {
	args: (ExpressionEntity | SpreadElement)[];
	thisArg: ExpressionEntity | null;
	type: typeof INTERACTION_CALLED;
	withNew: boolean;
}

export const NO_ARGS = [];

export type NodeInteraction =
	| NodeInteractionAccessed
	| NodeInteractionAssigned
	| NodeInteractionCalled;

export type NodeInteractionWithThisArg = NodeInteraction & { thisArg: ExpressionEntity };
