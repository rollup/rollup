import { CallOptions } from '../CallOptions';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import {
	arrayMembers,
	getMemberReturnExpressionWhenCalled,
	hasMemberEffectWhenCalled,
	UNKNOWN_EXPRESSION
} from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';
import SpreadElement from './SpreadElement';

export default class ArrayExpression extends NodeBase {
	elements!: (ExpressionNode | SpreadElement | null)[];
	type!: NodeType.tArrayExpression;
	private deoptimized = false;

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

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.deoptimized) {
			// We do not deoptimize in hasEffects because it is not possible to mutate elements of an
			// array without the inclusion of the array. The reason is that we do not know if an element
			// existed so we always include the mutation because it might throw an error
			this.deoptimized = true;
			for (const element of this.elements) {
				if (element !== null) element.deoptimizePath(UNKNOWN_PATH);
			}
		}
		this.included = true;
		for (const element of this.elements) {
			if (element) element.include(context, includeChildrenRecursively);
		}
	}
}
