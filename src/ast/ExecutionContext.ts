import type { Entity } from './Entity';
import type { ExpressionEntity } from './nodes/shared/Expression';
import { DiscriminatedPathTracker, EntityPathTracker } from './utils/PathTracker';
import type ThisVariable from './variables/ThisVariable';

interface ExecutionContextIgnore {
	breaks: boolean;
	continues: boolean;
	labels: Set<string>;
	returnYield: boolean;
	this: boolean;
}

interface ControlFlowContext {
	brokenFlow: boolean;
	hasBreak: boolean;
	hasContinue: boolean;
	includedLabels: Set<string>;
}

export interface InclusionContext extends ControlFlowContext {
	includedCallArguments: Set<Entity>;
	currentIncludedParameter: Set<ExpressionEntity>;
}

export interface HasEffectsContext extends ControlFlowContext {
	accessed: EntityPathTracker;
	assigned: EntityPathTracker;
	brokenFlow: boolean;
	parametersBeingCheckedForEffectsOnInteractionAtPath: Set<ExpressionEntity>;
	called: DiscriminatedPathTracker;
	ignore: ExecutionContextIgnore;
	instantiated: DiscriminatedPathTracker;
	replacedVariableInits: Map<ThisVariable, ExpressionEntity>;
}

export function createInclusionContext(): InclusionContext {
	return {
		brokenFlow: false,
		currentIncludedParameter: new Set(),
		hasBreak: false,
		hasContinue: false,
		includedCallArguments: new Set(),
		includedLabels: new Set()
	};
}

export function createHasEffectsContext(): HasEffectsContext {
	return {
		accessed: new EntityPathTracker(),
		assigned: new EntityPathTracker(),
		brokenFlow: false,
		called: new DiscriminatedPathTracker(),
		hasBreak: false,
		hasContinue: false,
		ignore: {
			breaks: false,
			continues: false,
			labels: new Set(),
			returnYield: false,
			this: false
		},
		includedLabels: new Set(),
		instantiated: new DiscriminatedPathTracker(),
		parametersBeingCheckedForEffectsOnInteractionAtPath: new Set(),
		replacedVariableInits: new Map()
	};
}
