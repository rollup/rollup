import type { Entity } from './Entity';
import type { ExpressionEntity } from './nodes/shared/Expression';
import { DiscriminatedPathTracker, PathTracker } from './utils/PathTracker';
import type ThisVariable from './variables/ThisVariable';

export const UnlabeledBreak = Symbol('Unlabeled Break');
export const UnlabeledContinue = Symbol('Unlabeled Continue');
export type Label = string | typeof UnlabeledBreak | typeof UnlabeledContinue;

interface ExecutionContextIgnore {
	labels: Set<Label>;
	returnYield: boolean;
	this: boolean;
}

interface ControlFlowContext {
	brokenFlow: boolean;
	includedLabels: Set<Label>;
}

export interface InclusionContext extends ControlFlowContext {
	includedCallArguments: Set<Entity>;
}

export interface HasEffectsContext extends ControlFlowContext {
	accessed: PathTracker;
	assigned: PathTracker;
	brokenFlow: boolean;
	called: DiscriminatedPathTracker;
	ignore: ExecutionContextIgnore;
	instantiated: DiscriminatedPathTracker;
	replacedVariableInits: Map<ThisVariable, ExpressionEntity>;
}

export function createInclusionContext(): InclusionContext {
	return {
		brokenFlow: false,
		includedCallArguments: new Set(),
		includedLabels: new Set()
	};
}

export function createHasEffectsContext(): HasEffectsContext {
	return {
		accessed: new PathTracker(),
		assigned: new PathTracker(),
		brokenFlow: false,
		called: new DiscriminatedPathTracker(),
		ignore: {
			labels: new Set(),
			returnYield: false,
			this: false
		},
		includedLabels: new Set(),
		instantiated: new DiscriminatedPathTracker(),
		replacedVariableInits: new Map()
	};
}
