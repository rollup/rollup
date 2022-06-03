import SpreadElement from './nodes/SpreadElement';
import { ExpressionEntity } from './nodes/shared/Expression';

export const INTERACTION_ACCESSED = 0;
export const INTERACTION_ASSIGNED = 1;
export const INTERACTION_CALLED = 2;

export interface NodeInteractionAccessed {
	thisArg: ExpressionEntity | null;
	type: typeof INTERACTION_ACCESSED;
}

interface NodeInteractionAssigned {
	thisArg: ExpressionEntity | null;
	type: typeof INTERACTION_ASSIGNED;
	value: ExpressionEntity;
}

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
