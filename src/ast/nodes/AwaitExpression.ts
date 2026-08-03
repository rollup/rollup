import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { ObjectPath } from '../utils/PathTracker';
import ArrowFunctionExpression from './ArrowFunctionExpression';
import type * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';
import { type ExpressionNode, type IncludeChildren, type Node, NodeBase } from './shared/Node';

export default class AwaitExpression extends NodeBase {
	declare argument: ExpressionNode;
	/** Marked with #__PURE__ annotation */
	declare annotationPure?: boolean;
	declare type: NodeType.tAwaitExpression;

	deoptimizePath(path: ObjectPath) {
		this.argument.deoptimizePath(path);
	}

	hasEffects(_context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (this.annotationPure) {
			return false;
		}
		return true;
	}

	initialise(): void {
		super.initialise();
		if (
			this.annotations &&
			(this.scope.context.options.treeshake as NormalizedTreeshakingOptions).annotations
		) {
			this.annotationPure = this.annotations.some(comment => comment.type === 'pure');
		}
		let parent = this.parent;
		do {
			if (parent instanceof FunctionNode || parent instanceof ArrowFunctionExpression) return;
		} while ((parent = (parent as Node).parent as Node));
		this.scope.context.usesTopLevelAwait = true;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) this.includeNode(context);
		this.argument.include(context, includeChildrenRecursively);
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
		// Thenables need to be included
		this.argument.includePath(THEN_PATH, context);
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (!this.included) this.includeNode(context);
		this.argument.includePath(path, context);
	}
}

const THEN_PATH = ['then'];
