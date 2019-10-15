import { CallOptions } from '../CallOptions';
import { HasEffectsContext } from '../ExecutionContext';
import { ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import {
	arrayMembers,
	getMemberReturnExpressionWhenCalled,
	hasMemberEffectWhenCalled,
	UNKNOWN_EXPRESSION
} from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import SpreadElement from './SpreadElement';

export default class ArrayExpression extends NodeBase {
	elements!: (ExpressionNode | SpreadElement | null)[];
	type!: NodeType.tArrayExpression;

	bind() {
		super.bind();
		for (const element of this.elements) {
			if (element !== null) element.deoptimizePath(UNKNOWN_PATH);
		}
	}

	getReturnExpressionWhenCalledAtPath(path: ObjectPath) {
		if (path.length !== 1) return UNKNOWN_EXPRESSION;
		return getMemberReturnExpressionWhenCalled(arrayMembers, path[0]);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		if (path.length === 1) {
			return hasMemberEffectWhenCalled(arrayMembers, path[0], this.included, callOptions, context);
		}
		return true;
	}
}
