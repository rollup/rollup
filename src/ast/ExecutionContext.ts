import { Entity } from './Entity';
import { ExpressionEntity } from './nodes/shared/Expression';
import { DiscriminatedPathTracker, PathTracker } from './utils/PathTracker';
import ThisVariable from './variables/ThisVariable';

interface ExecutionContextIgnore {
	breaks: boolean;
	continues: boolean;
	labels: Set<string>;
	returnAwaitYield: boolean;
}

export const BROKEN_FLOW_NONE = 0;
export const BROKEN_FLOW_BREAK_CONTINUE = 1;
export const BROKEN_FLOW_ERROR_RETURN_LABEL = 2;

interface ControlFlowContext {
	brokenFlow: number;
	includedLabels: Set<string>;
}

export interface InclusionContext extends ControlFlowContext {
	includedCallArguments: Set<Entity>;
}

export interface HasEffectsContext extends ControlFlowContext {
	accessed: PathTracker;
	assigned: PathTracker;
	brokenFlow: number;
	called: DiscriminatedPathTracker;
	ignore: ExecutionContextIgnore;
	instantiated: DiscriminatedPathTracker;
	replacedVariableInits: Map<ThisVariable, ExpressionEntity>;
}

export function createInclusionContext(): InclusionContext {
	return {
		brokenFlow: BROKEN_FLOW_NONE,
		includedCallArguments: new Set(),
		includedLabels: new Set()
	};
}

export function createHasEffectsContext(): HasEffectsContext {
	return {
		accessed: new PathTracker(),
		assigned: new PathTracker(),
		brokenFlow: BROKEN_FLOW_NONE,
		called: new DiscriminatedPathTracker(),
		ignore: {
			breaks: false,
			continues: false,
			labels: new Set(),
			returnAwaitYield: false
		},
		includedLabels: new Set(),
		instantiated: new DiscriminatedPathTracker(),
		replacedVariableInits: new Map()
	};
}
