import { ExpressionEntity } from './nodes/shared/Expression';
import ThisVariable from './variables/ThisVariable';

interface ExecutionContextIgnore {
	breakStatements: boolean;
	labels: Set<string>;
	returnAwaitYield: boolean;
}

export interface ExecutionContext {
	ignore: ExecutionContextIgnore;
	replacedVariableInits: Map<ThisVariable, ExpressionEntity>;
}

export function createExecutionContext(): ExecutionContext {
	return {
		ignore: {
			breakStatements: false,
			labels: new Set(),
			returnAwaitYield: false
		},
		replacedVariableInits: new Map()
	};
}
