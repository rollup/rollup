import { CallOptions } from '../CallOptions';
import { HasEffectsContext } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath } from '../utils/PathTracker';
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

	hasEffects(context: HasEffectsContext) {
		return this.key.hasEffects(context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	) {
		return (
			path.length > 0 || this.value.hasEffectsWhenCalledAtPath(EMPTY_PATH, callOptions, context)
		);
	}
}
