import { ExpressionEntity } from './nodes/shared/Expression';
import ThisVariable from './variables/ThisVariable';

export interface ExecutionContext {
	ignoreBreakStatements: boolean;
	ignoredLabels: Set<string>;
	ignoreReturnAwaitYield: boolean;
	replacedVariableInits: Map<ThisVariable, ExpressionEntity>;
}

export function createExecutionContext(): ExecutionContext {
	return {
		ignoreBreakStatements: false,
		ignoredLabels: new Set(),
		ignoreReturnAwaitYield: false,
		replacedVariableInits: new Map()
	};
}
