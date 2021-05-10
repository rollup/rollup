import { CallOptions } from '../CallOptions';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import { arrayMembers, getMemberReturnExpressionWhenCalled, hasMemberEffectWhenCalled } from '../values';
import * as NodeType from './NodeType';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';
import SpreadElement from './SpreadElement';

// TODO Lukas turn into specific object entities
export default class ArrayExpression extends NodeBase {
	elements!: (ExpressionNode | SpreadElement | null)[];
	type!: NodeType.tArrayExpression;
	private deoptimized = false;

	getReturnExpressionWhenCalledAtPath(path: ObjectPath) {
		if (path.length !== 1) return UNKNOWN_EXPRESSION;
		return getMemberReturnExpressionWhenCalled(arrayMembers, path[0]);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		for (const element of this.elements) {
			if (element && element.hasEffects(context)) {
				return true;
			}
		}
		return false;
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
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		for (const element of this.elements) {
			if (element) {
				element.include(context, includeChildrenRecursively);
			}
		}
	}

	private applyDeoptimizations():void {
		this.deoptimized = true;
		for (const element of this.elements) {
			if (element !== null) element.deoptimizePath(UNKNOWN_PATH);
		}
	}
}
