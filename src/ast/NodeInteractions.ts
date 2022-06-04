import SpreadElement from './nodes/SpreadElement';
import { ExpressionEntity } from './nodes/shared/Expression';

// TODO Lukas for usages and see if caching makes sense
export const INTERACTION_ACCESSED = 0;
export const INTERACTION_ASSIGNED = 1;
export const INTERACTION_CALLED = 2;

export interface NodeInteractionAccessed {
	type: typeof INTERACTION_ACCESSED;
}

export interface NodeInteractionAssigned {
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

// TODO Lukas destructure interactions where they are not forwarded
export type NodeInteraction =
	| NodeInteractionAccessed
	| NodeInteractionAssigned
	| NodeInteractionCalled;

// TODO Lukas getters and setters can only every have their actual parent as thisArg -> do not add them to the interaction but get them statically
export type NodeInteractionWithThisArg = NodeInteraction & { thisArg: ExpressionEntity };
