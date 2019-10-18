import { ExpressionEntity } from './nodes/shared/Expression';
import { PathTracker } from './utils/PathTracker';
import ThisVariable from './variables/ThisVariable';

interface ExecutionContextIgnore {
	breakStatements: boolean;
	labels: Set<string>;
	returnAwaitYield: boolean;
}

// TODO Lukas rename to broken flow
export const BREAKFLOW_NONE = 0;
export const BREAKFLOW_BREAK_CONTINUE = 1;
export const BREAKFLOW_ERROR_RETURN_LABEL = 2;

export interface InclusionContext {
	breakFlow: number;
	includedLabels: Set<string>;
}

export interface HasEffectsContext extends InclusionContext {
	accessed: PathTracker;
	assigned: PathTracker;
	breakFlow: number;
	called: PathTracker;
	ignore: ExecutionContextIgnore;
	instantiated: PathTracker;
	replacedVariableInits: Map<ThisVariable, ExpressionEntity>;
}

export function createInclusionContext(): InclusionContext {
	return {
		breakFlow: BREAKFLOW_NONE,
		includedLabels: new Set()
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
		includedLabels: new Set(),
		instantiated: new PathTracker(),
		replacedVariableInits: new Map()
	};
}
