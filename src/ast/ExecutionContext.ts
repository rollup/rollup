import CallExpression from './nodes/CallExpression';
import { ExpressionEntity } from './nodes/shared/Expression';
import ThisVariable from './variables/ThisVariable';

interface ExecutionContextIgnore {
	breakStatements: boolean;
	labels: Set<string>;
	returnAwaitYield: boolean;
}

export interface ExecutionContext {
	calledExpressions: Set<CallExpression>;
	ignore: ExecutionContextIgnore;
	replacedVariableInits: Map<ThisVariable, ExpressionEntity>;
}

export function createExecutionContext(): ExecutionContext {
	return {
		calledExpressions: new Set(),
		ignore: {
			breakStatements: false,
			labels: new Set(),
			returnAwaitYield: false
		},
		replacedVariableInits: new Map()
	};
}
