import { NormalizedTreeshakingOptions } from '../../rollup/types';
import { CallOptions } from '../CallOptions';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import * as NodeType from './NodeType';
import { Annotation, ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';

export default class NewExpression extends NodeBase {
	arguments!: ExpressionNode[];
	callee!: ExpressionNode;
	type!: NodeType.tNewExpression;
	private callOptions!: CallOptions;
	private deoptimized = false;

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		for (const argument of this.arguments) {
			if (argument.hasEffects(context)) return true;
		}
		if (
			(this.context.options.treeshake as NormalizedTreeshakingOptions).annotations &&
			this.annotations?.some((a: Annotation) => a.pure)
		)
			return false;
		return (
			this.callee.hasEffects(context) ||
			this.callee.hasEffectsWhenCalledAtPath(EMPTY_PATH, this.callOptions, context)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		return path.length > 0;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		this.callee.include(context, includeChildrenRecursively);
		for (const argument of this.arguments) {
			argument.include(context, includeChildrenRecursively);
		}
	}

	initialise() {
		this.callOptions = {
			args: this.arguments,
			withNew: true
		};
	}

	private applyDeoptimizations(): void {
		this.deoptimized = true;
		for (const argument of this.arguments) {
			// This will make sure all properties of parameters behave as "unknown"
			argument.deoptimizePath(UNKNOWN_PATH);
		}
	}
}
