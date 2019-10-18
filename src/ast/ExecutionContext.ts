import { ExpressionEntity } from './nodes/shared/Expression';
import { PathTracker } from './utils/PathTracker';
import ThisVariable from './variables/ThisVariable';

interface ExecutionContextIgnore {
	breakStatements: boolean;
	labels: Set<string>;
	returnAwaitYield: boolean;
}

export const BREAKFLOW_NONE = 0;
export const BREAKFLOW_BREAK_CONTINUE = 1;
export const BREAKFLOW_ERROR_RETURN_LABEL = 2;

export interface InclusionContext {
	breakFlow: number;
}

export interface HasEffectsContext extends InclusionContext {
	accessed: PathTracker;
	assigned: PathTracker;
	called: PathTracker;
	ignore: ExecutionContextIgnore;
	instantiated: PathTracker;
	replacedVariableInits: Map<ThisVariable, ExpressionEntity>;
}

export function createInclusionContext(): InclusionContext {
	return {
		breakFlow: BREAKFLOW_NONE
	};
}

export function createHasEffectsContext(): HasEffectsContext {
	return {
		accessed: new PathTracker(),
		assigned: new PathTracker(),
		breakFlow: BREAKFLOW_NONE,
		called: new PathTracker(),
		ignore: {
			breakStatements: false,
			labels: new Set(),
			returnAwaitYield: false
		},
		instantiated: new PathTracker(),
		replacedVariableInits: new Map()
	};
}
