import { ExpressionEntity } from './nodes/shared/Expression';
import { PathTracker } from './utils/PathTracker';
import ThisVariable from './variables/ThisVariable';

interface ExecutionContextIgnore {
	breakStatements: boolean;
	labels: Set<string>;
	returnAwaitYield: boolean;
}

export enum BreakFlow {
	None = 0,
	Error
}

export interface ExecutionContext {
	breakFlow: BreakFlow;
}

export interface EffectsExecutionContext {
	accessed: PathTracker;
	assigned: PathTracker;
	called: PathTracker;
	ignore: ExecutionContextIgnore;
	instantiated: PathTracker;
	replacedVariableInits: Map<ThisVariable, ExpressionEntity>;
}

export function createExecutionContext(): ExecutionContext {
	return {
		breakFlow: BreakFlow.None
	};
}

export function createEffectsExecutionContext(): EffectsExecutionContext {
	return {
		accessed: new PathTracker(),
		assigned: new PathTracker(),
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
