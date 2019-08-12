import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_PATH, ObjectPath } from '../values';
import FunctionExpression from './FunctionExpression';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class MethodDefinition extends NodeBase {
	computed!: boolean;
	key!: ExpressionNode;
	kind!: 'constructor' | 'method' | 'get' | 'set';
	static!: boolean;
	type!: NodeType.tMethodDefinition;
	value!: FunctionExpression;

	hasEffects(options: ExecutionPathOptions) {
		return this.key.hasEffects(options);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	) {
		return (
			path.length > 0 || this.value.hasEffectsWhenCalledAtPath(EMPTY_PATH, callOptions, options)
		);
	}
}
