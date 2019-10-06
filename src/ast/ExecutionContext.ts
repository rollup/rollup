import { ExpressionEntity } from './nodes/shared/Expression';
import { PathTracker } from './utils/PathTracker';
import ThisVariable from './variables/ThisVariable';

interface ExecutionContextIgnore {
	breakStatements: boolean;
	labels: Set<string>;
	returnAwaitYield: boolean;
}

export enum BreakFlowType {
	None = 0,
	BreakContinue,
	Return,
	Error
}

export interface BreakFlow {
	label: string | null;
	type: BreakFlowType;
}

export interface ExecutionContext {
	breakFlow: false | BreakFlow;
}

export interface EffectsExecutionContext extends ExecutionContext {
	accessed: PathTracker;
	assigned: PathTracker;
	called: PathTracker;
	ignore: ExecutionContextIgnore;
	instantiated: PathTracker;
	replacedVariableInits: Map<ThisVariable, ExpressionEntity>;
}

export function createExecutionContext(): ExecutionContext {
	return {
		breakFlow: false
	};
}

export function createEffectsExecutionContext(): EffectsExecutionContext {
	return {
		accessed: new PathTracker(),
		assigned: new PathTracker(),
		breakFlow: false,
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
