import { ExpressionEntity } from './nodes/shared/Expression';
import { PathTracker } from './utils/PathTracker';
import ThisVariable from './variables/ThisVariable';

interface ExecutionContextIgnore {
	breakStatements: boolean;
	labels: Set<string>;
	returnAwaitYield: boolean;
}

export const BREAKFLOW_NONE: false = false;
export const BREAKFLOW_ERROR_RETURN: true = true;

export type BreakFlow = typeof BREAKFLOW_NONE | typeof BREAKFLOW_ERROR_RETURN | Set<string | null>;

export interface InclusionContext {
	breakFlow: BreakFlow;
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
