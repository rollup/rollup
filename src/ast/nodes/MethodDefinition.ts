import Node from '../Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import FunctionExpression from './FunctionExpression';
import Expression from './Expression';
import CallOptions from '../CallOptions';
import { ObjectPath } from '../variables/VariableReassignmentTracker';

export default class MethodDefinition extends Node {
	type: 'MethodDefinition';
	key: Expression;
	value: FunctionExpression;
	kind: 'constructor' | 'method' | 'get' | 'set';
	computed: boolean;
	static: boolean;

	hasEffects (options: ExecutionPathOptions) {
		return this.key.hasEffects(options);
	}

	hasEffectsWhenCalledAtPath (path: ObjectPath, callOptions: CallOptions, options: ExecutionPathOptions) {
		return (
			path.length > 0 ||
			this.value.hasEffectsWhenCalledAtPath([], callOptions, options)
		);
	}
}
