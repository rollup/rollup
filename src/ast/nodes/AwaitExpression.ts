import type { InclusionContext } from '../ExecutionContext';
import { markTopLevelAwait } from '../utils/markTopLevelAwait';
import type { ObjectPath } from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import { type ExpressionNode, type IncludeChildren, NodeBase } from './shared/Node';

export default class AwaitExpression extends NodeBase {
	declare argument: ExpressionNode;
	declare type: NodeType.tAwaitExpression;

	deoptimizePath(path: ObjectPath) {
		this.argument.deoptimizePath(path);
	}

	hasEffects(): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return true;
	}

	initialise(): void {
		super.initialise();
		markTopLevelAwait(this);
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
